
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useState } from "react";

const formSchema = z.object({
  email: z.string().email(),
});

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export const ForgotPasswordForm = ({ onBack }: ForgotPasswordFormProps) => {
  const { resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      await resetPassword(values.email);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Button type="button" variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      <h2 className="text-2xl font-light text-[#8A0303]">Reset Password</h2>
      <p className="text-gray-500 font-light">Enter your email to reset your password.</p>
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
          <div className="flex justify-center">
            <Button 
              type="submit" 
              className="px-8 py-2 bg-white hover:bg-gray-50 text-[#8A0303] border border-[#8A0303] hover:border-[#6b0202] rounded-full shadow-lg hover:shadow-[0_0_20px_rgba(138,3,3,0.3)] transition-all duration-300 ease-out"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
