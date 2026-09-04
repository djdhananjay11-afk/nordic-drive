"use client";

import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ShowcaseModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="neon">
          <Sparkles className="mr-2 size-4" />
          Preview modal
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Premium decision layer</DialogTitle>
          <DialogDescription>
            Use this modal pattern for recommendations, saved comparisons, admin confirmations,
            and focused car configuration steps.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4 text-sm text-muted-foreground">
          Glass surface, dark backdrop, calm entrance animation, and accessible Radix behavior.
        </div>
        <DialogFooter>
          <Button variant="glass">Cancel</Button>
          <Button>Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
