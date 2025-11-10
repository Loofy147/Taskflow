import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { authService } from "@/services/api/authService";
import { useState } from "react";

const passwordResetSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type PasswordResetFormValues = z.infer<typeof passwordResetSchema>;

export function PasswordResetForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<PasswordResetFormValues>({
    resolver: zodResolver(passwordResetSchema),
  });
  const [message, setMessage] = useState("");

  const onSubmit = async (data: PasswordResetFormValues) => {
    try {
      await authService.resetPassword(data.email);
      setMessage("Password reset link sent. Please check your email.");
    } catch (error) {
      console.error(error);
      setMessage("Failed to send password reset link.");
    }
  };

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Reset Password</CardTitle>
        <CardDescription>
          Enter your email to reset your password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" {...register("email")} />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>
          <Button type="submit" className="w-full">
            Send reset link
          </Button>
          {message && <p className="text-sm text-center mt-4">{message}</p>}
        </form>
        <div className="mt-4 text-center text-sm">
          Remember your password?{" "}
          <Link to="/login" className="underline">
            Login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
