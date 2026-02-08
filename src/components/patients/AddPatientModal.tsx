"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { Loader2, AlertTriangle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/design-system/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/design-system/components/ui/alert-dialog";
import { Button } from "@/design-system/components/ui/button";
import { Input } from "@/design-system/components/ui/input";
import { Label } from "@/design-system/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/design-system/components/ui/select";
import { Text } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";
import {
  useCreatePatient,
  useCreatePatientForced,
  type CreatePatientData,
  type DuplicatePatientResponse,
} from "@/src/lib/queries/use-patients";
import { DEMO_PRACTICE_ID } from "@/src/lib/utils/demo-date";
import type { Patient } from "@/src/lib/supabase/types";

export interface AddPatientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPatientCreated?: (patient: Patient) => void;
  practiceId?: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  gender?: string;
  pronouns?: string;
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressZip?: string;
  insuranceProvider?: string;
  insuranceMemberId?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

/**
 * Format phone number as (XXX) XXX-XXXX
 */
function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function AddPatientModal({
  open,
  onOpenChange,
  onPatientCreated,
  practiceId = DEMO_PRACTICE_ID,
}: AddPatientModalProps) {
  const createPatient = useCreatePatient();
  const createPatientForced = useCreatePatientForced();

  const [duplicateData, setDuplicateData] = React.useState<DuplicatePatientResponse | null>(null);
  const [formDataForForce, setFormDataForForce] = React.useState<CreatePatientData | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      phone: "",
      email: "",
      gender: "",
      pronouns: "",
    },
  });

  const phoneValue = watch("phone");

  // Format phone on change
  React.useEffect(() => {
    const formatted = formatPhoneNumber(phoneValue || "");
    if (formatted !== phoneValue) {
      setValue("phone", formatted);
    }
  }, [phoneValue, setValue]);

  const handleClose = () => {
    reset();
    setDuplicateData(null);
    setFormDataForForce(null);
    onOpenChange(false);
  };

  const onSubmit = async (data: FormData) => {
    const patientData: CreatePatientData = {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      dateOfBirth: data.dateOfBirth,
      phone: data.phone,
      email: data.email.trim().toLowerCase(),
      gender: data.gender as CreatePatientData["gender"],
      pronouns: data.pronouns as CreatePatientData["pronouns"],
      addressStreet: data.addressStreet,
      addressCity: data.addressCity,
      addressState: data.addressState,
      addressZip: data.addressZip,
      insuranceProvider: data.insuranceProvider,
      insuranceMemberId: data.insuranceMemberId,
      emergencyContactName: data.emergencyContactName,
      emergencyContactPhone: data.emergencyContactPhone,
      practiceId,
    };

    try {
      const result = await createPatient.mutateAsync(patientData);

      if (result.duplicate) {
        setDuplicateData(result.duplicate);
        setFormDataForForce(patientData);
        return;
      }

      if (result.patient) {
        onPatientCreated?.(result.patient);
        handleClose();
      }
    } catch (error) {
      console.error("Failed to create patient:", error);
    }
  };

  const handleForceCreate = async () => {
    if (!formDataForForce) return;

    try {
      const patient = await createPatientForced.mutateAsync(formDataForForce);
      onPatientCreated?.(patient);
      handleClose();
    } catch (error) {
      console.error("Failed to force create patient:", error);
    }
  };

  const isLoading = createPatient.isPending || createPatientForced.isPending;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Add New Patient</SheetTitle>
            <SheetDescription>
              Enter patient information. Required fields are marked with *.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <Text weight="medium" className="text-foreground">
                Basic Information
              </Text>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    {...register("firstName", { required: "First name is required" })}
                    className={cn("min-h-[44px]", errors.firstName && "border-destructive")}
                    aria-invalid={errors.firstName ? "true" : "false"}
                  />
                  {errors.firstName && (
                    <Text size="xs" className="text-destructive">
                      {errors.firstName.message}
                    </Text>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Last Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    {...register("lastName", { required: "Last name is required" })}
                    className={cn("min-h-[44px]", errors.lastName && "border-destructive")}
                    aria-invalid={errors.lastName ? "true" : "false"}
                  />
                  {errors.lastName && (
                    <Text size="xs" className="text-destructive">
                      {errors.lastName.message}
                    </Text>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">
                  Date of Birth <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...register("dateOfBirth", { required: "Date of birth is required" })}
                  className={cn("min-h-[44px]", errors.dateOfBirth && "border-destructive")}
                  aria-invalid={errors.dateOfBirth ? "true" : "false"}
                />
                {errors.dateOfBirth && (
                  <Text size="xs" className="text-destructive">
                    {errors.dateOfBirth.message}
                  </Text>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select onValueChange={(val) => setValue("gender", val)}>
                    <SelectTrigger className="min-h-[44px]">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Male</SelectItem>
                      <SelectItem value="F">Female</SelectItem>
                      <SelectItem value="Non-binary">Non-binary</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                      <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pronouns">Pronouns</Label>
                  <Select onValueChange={(val) => setValue("pronouns", val)}>
                    <SelectTrigger className="min-h-[44px]">
                      <SelectValue placeholder="Select pronouns" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="He/Him">He/Him</SelectItem>
                      <SelectItem value="She/Her">She/Her</SelectItem>
                      <SelectItem value="They/Them">They/Them</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <Text weight="medium" className="text-foreground">
                Contact Information
              </Text>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register("phone", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^\(\d{3}\) \d{3}-\d{4}$/,
                      message: "Please enter a valid 10-digit phone number",
                    },
                  })}
                  placeholder="(555) 123-4567"
                  className={cn("min-h-[44px]", errors.phone && "border-destructive")}
                  aria-invalid={errors.phone ? "true" : "false"}
                />
                {errors.phone && (
                  <Text size="xs" className="text-destructive">
                    {errors.phone.message}
                  </Text>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Please enter a valid email address",
                    },
                  })}
                  placeholder="patient@email.com"
                  className={cn("min-h-[44px]", errors.email && "border-destructive")}
                  aria-invalid={errors.email ? "true" : "false"}
                />
                {errors.email && (
                  <Text size="xs" className="text-destructive">
                    {errors.email.message}
                  </Text>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <Text weight="medium" className="text-foreground">
                Address (Optional)
              </Text>

              <div className="space-y-2">
                <Label htmlFor="addressStreet">Street Address</Label>
                <Input id="addressStreet" {...register("addressStreet")} className="min-h-[44px]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="addressCity">City</Label>
                  <Input id="addressCity" {...register("addressCity")} className="min-h-[44px]" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressState">State</Label>
                  <Input
                    id="addressState"
                    {...register("addressState")}
                    maxLength={2}
                    placeholder="CA"
                    className="min-h-[44px]"
                  />
                </div>
              </div>

              <div className="w-1/2">
                <div className="space-y-2">
                  <Label htmlFor="addressZip">ZIP Code</Label>
                  <Input
                    id="addressZip"
                    {...register("addressZip")}
                    maxLength={10}
                    placeholder="12345"
                    className="min-h-[44px]"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-4">
              <Text weight="medium" className="text-foreground">
                Emergency Contact (Optional)
              </Text>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactName">Name</Label>
                  <Input
                    id="emergencyContactName"
                    {...register("emergencyContactName")}
                    className="min-h-[44px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone">Phone</Label>
                  <Input
                    id="emergencyContactPhone"
                    type="tel"
                    {...register("emergencyContactPhone")}
                    placeholder="(555) 123-4567"
                    className="min-h-[44px]"
                  />
                </div>
              </div>
            </div>

            {/* Insurance */}
            <div className="space-y-4">
              <Text weight="medium" className="text-foreground">
                Insurance (Optional)
              </Text>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="insuranceProvider">Provider</Label>
                  <Input
                    id="insuranceProvider"
                    {...register("insuranceProvider")}
                    className="min-h-[44px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insuranceMemberId">Member ID</Label>
                  <Input
                    id="insuranceMemberId"
                    {...register("insuranceMemberId")}
                    className="min-h-[44px]"
                  />
                </div>
              </div>
            </div>

            <SheetFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="min-h-[44px]"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="min-h-[44px]">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Patient"
                )}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Duplicate Detection Alert */}
      <AlertDialog open={!!duplicateData} onOpenChange={() => setDuplicateData(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-warning h-5 w-5" />
              Potential Duplicate Found
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>{duplicateData?.message}</p>
                {duplicateData?.existingPatient && (
                  <div className="bg-muted mt-2 rounded-md p-3">
                    <Text size="sm" weight="medium">
                      Existing patient:
                    </Text>
                    <Text size="sm" muted>
                      {duplicateData.existingPatient.first_name}{" "}
                      {duplicateData.existingPatient.last_name} - DOB:{" "}
                      {duplicateData.existingPatient.date_of_birth}
                    </Text>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDuplicateData(null)} className="min-h-[44px]">
              Go Back
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleForceCreate}
              disabled={createPatientForced.isPending}
              className="min-h-[44px]"
            >
              {createPatientForced.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Anyway"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
