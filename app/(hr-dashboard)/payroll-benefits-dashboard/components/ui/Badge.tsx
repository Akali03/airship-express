import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/helpers/classNames';

const badgeVariants = cva(
    "inline-flex items-center border rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default: "bg-accent/10 border-transparent text-accent-dark", // Pink theme
                secondary: "bg-paper border-line text-muted", // Light gray theme
                destructive: "bg-red-100 border-transparent text-red-700",
                outline: "text-ink border-line",
                success: "bg-green-100 border-transparent text-green-700",
                warning: "bg-yellow-100 border-transparent text-yellow-700",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}

export { Badge, badgeVariants };