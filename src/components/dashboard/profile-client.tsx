
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import React from "react";

const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email."),
  phone: z.string().optional(),
  dob: z.string().optional(),
  profilePicture: z.string().url("Please enter a valid URL.").optional(),
  monthlyIncome: z.coerce.number().min(0, "Income must be a positive number.").optional(),
});

export function ProfileClient() {
  const { profile, updateProfile, loading } = useProfile();
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    values: {
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        dob: profile.dob || "",
        profilePicture: profile.profilePicture || "",
        monthlyIncome: profile.monthlyIncome || 0,
    },
    // Reset values when the profile data loads
    resetOptions: {
        keepDirtyValues: true,
    }
  });

  React.useEffect(() => {
    if (!loading) {
      form.reset({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        dob: profile.dob || "",
        profilePicture: profile.profilePicture || "",
        monthlyIncome: profile.monthlyIncome || 0,
      });
    }
  }, [loading, profile, form]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        form.setValue("profilePicture", base64String);
      };
      reader.readAsDataURL(file);
    }
  };


  function onSubmit(values: z.infer<typeof profileFormSchema>) {
    updateProfile(values);
    toast({
      title: "Profile Updated",
      description: "Your information has been saved successfully.",
    });
  }

  if (loading) {
    return <p>Loading profile...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Update your photo and personal details here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
                control={form.control}
                name="profilePicture"
                render={({ field }) => (
                    <FormItem className="flex flex-col items-center">
                        <FormLabel className="cursor-pointer relative" onClick={handleAvatarClick}>
                            <Avatar className="w-32 h-32">
                                <AvatarImage src={field.value} alt="Profile picture" />
                                <AvatarFallback className="text-4xl">{profile.name?.[0]}</AvatarFallback>
                            </Avatar>
                             <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full opacity-0 hover:opacity-100 transition-opacity">
                                <Camera className="text-white h-8 w-8" />
                            </div>
                        </FormLabel>
                        <FormControl>
                            <Input 
                                type="file" 
                                className="hidden" 
                                ref={fileInputRef} 
                                onChange={handleFileChange}
                                accept="image/png, image/jpeg, image/gif"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
            )}/>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl><Input placeholder="Your Name" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input type="email" placeholder="your.email@example.com" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl><Input placeholder="123-456-7890" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="dob" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                 <FormField control={form.control} name="monthlyIncome" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Monthly Income (₹)</FormLabel>
                        <FormControl><Input type="number" placeholder="50000" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
            </div>
            
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
