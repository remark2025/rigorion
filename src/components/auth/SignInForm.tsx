
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/components/auth/AuthProvider";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

interface SignInFormProps {
  onForgotPassword?: () => void;
  onSuccess?: () => void;
}

export const SignInForm = ({ onForgotPassword, onSuccess }: SignInFormProps) => {
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      await signIn(values.email, values.password);
      onSuccess?.();
      navigate("/");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-light text-gray-600">Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" className="rounded-full border-gray-300 focus:border-[#8A0303] focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-light text-gray-600">Password</FormLabel>
              <FormControl>
                <Input {...field} type="password" className="rounded-full border-gray-300 focus:border-[#8A0303] focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="text-right">
          {onForgotPassword && (
            <Button 
              type="button" 
              variant="link" 
              onClick={onForgotPassword}
              className="p-0 h-auto font-light text-sm text-gray-500 hover:text-[#8A0303]"
            >
              Forgot password?
            </Button>
          )}
        </div>
        <div className="flex justify-center">
          <Button 
            type="submit" 
            className="px-8 py-2 bg-white hover:bg-gray-50 text-[#8A0303] border border-[#8A0303] hover:border-[#6b0202] rounded-full shadow-lg hover:shadow-[0_0_20px_rgba(138,3,3,0.3)] transition-all duration-300 ease-out"
            disabled={isLoading}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
