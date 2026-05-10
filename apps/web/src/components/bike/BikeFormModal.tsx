import { useCreateBike, useUpdateBike } from "@/hooks/useBike";
import { Bike } from "@/types/bike.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateBikeInput, CreateBikeSchema, UpdateBikeInput, UpdateBikeSchema } from "@velorent/shared";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";




interface Props {
    bike?: Bike;
    onClose: () => void;
    onSuccess: () => void;
}

export default function BikeFormModal({ bike, onClose, onSuccess }: Props) {
    const isEdit = !!bike;

    const { mutate: createBike, isPending: isCreating, error: createError } = useCreateBike();

    const { mutate: updateBike, isPending: isUpdating, error: updateError } = useUpdateBike(bike?._id ?? '');

    const isPending = isCreating || isUpdating;
    const apiError = (createError || updateError) as any;
    const errMsg = apiError?.response?.data?.error?.message;

    const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateBikeInput>({
        resolver: zodResolver(isEdit ? UpdateBikeSchema : CreateBikeSchema),
        defaultValues: bike ? {
            serialNumber: bike.serialNumber,
            name: bike.name,
            category: bike.category,
            style: bike.style,
        } : undefined,
    });

    const onSubmit = (data: CreateBikeInput) => {
        if (isEdit) {
            updateBike(data as UpdateBikeInput, { onSuccess });
        } else {
            createBike(data, { onSuccess });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[hsl(var(--card))] rounded-3xl border border-[hsl(var(--border))] shadow-2xl w-full max-w-md">

                {/* header */}
                <div className="flex items-center justify-between p-6 border-b border-[hsl(var(--border))]">
                    <h3 className="font-bold text-[hsl(var(--foreground))] text-lg">
                        {isEdit ? 'Edit Bike' : 'Add New Bike'}
                    </h3>
                    <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                        <X size={20} />
                    </button>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">

                    {errMsg && (
                        <div className="bg-red-500 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                            {errMsg}
                        </div>
                    )}

                    <Input
                        label="Serial Number"
                        placeholder="BIKE-001"
                        required
                        error={errors.serialNumber?.message}
                        {...register('serialNumber')}
                    />

                    <Input
                        label="Bike Name"
                        placeholder="Kid BMX #1"
                        required
                        error={errors.name?.message}
                        {...register('name')}
                    />

                    {/* category */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-[hsl(var(--foreground))]">
                            Category <span className="text-red-600">*</span>
                        </label>
                        <select
                            {...register('category')}
                            className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm outline-none focus:ring-[hsl(var(--primary)/0.3)] focus:border-[hsl(var(--primary))]">
                            <option value="">Select Category</option>
                            <option value="solo">Solo</option>
                            <option value="kid">Kid</option>
                            <option value="family">Family</option>
                        </select>
                        {errors.category && (
                            <p className="text-xs text-red-500">{errors.category.message}</p>
                        )}
                    </div>

                    {/* style */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-[hsl(var(--foreground))]">
                            Style <span className="text-red-600">*</span>
                        </label>
                        <select
                            {...register('style')}
                            className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)] focus:border-[hsl(var(--primary))]">
                            <option value="">Select Style</option>
                            <option value="standard">Standard</option>
                            <option value="mountain">Mountain</option>
                            <option value="bmx">BMX</option>
                        </select>
                        {errors.style && (
                            <p className="text-xs text-red-500">{errors.style.message}</p>
                        )}
                    </div>

                    {/* button ations */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            fullWidth
                            onClick={onClose}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" fullWidth loading={isPending}>
                            {isEdit ? 'Save Changes' : 'Add Bike'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}