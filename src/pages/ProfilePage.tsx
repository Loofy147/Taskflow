import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { supabase } from '@/lib/supabase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ProfilePage = () => {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || '');
      setAvatarUrl(user.user_metadata?.avatar_url || null);
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase.auth.updateUser({
      data: { full_name: fullName },
    });

    if (data.user) {
      setUser(data.user);
    }
    setLoading(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) {
      return;
    }

    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    setLoading(true);
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      // TODO: Handle error
      setLoading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const { data, error } = await supabase.auth.updateUser({
      data: { avatar_url: publicUrl },
    });

    if (data.user) {
      setUser(data.user);
      setAvatarUrl(publicUrl);
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarUrl ?? undefined} alt={user?.email} />
              <AvatarFallback>{fullName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <Label htmlFor="avatar-upload">Change Avatar</Label>
              <Input id="avatar-upload" type="file" onChange={handleAvatarUpload} disabled={loading} />
            </div>
          </div>
          <form onSubmit={handleUpdateProfile}>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user?.email || ''} disabled />
              </div>
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Profile'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
