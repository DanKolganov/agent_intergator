import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message?: string;
}

export function PaywallDialog({ open, onOpenChange, message }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Лимит исчерпан</DialogTitle>
          <DialogDescription>
            {message || "Вы использовали 2 бесплатных AI-запроса. Оплатите доступ к дополнительным запросам."}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          Сейчас оплата не подключена автоматически. Если хотите — я добавлю Stripe Checkout и тарифы.
        </div>

        <DialogFooter>
          <button
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
            onClick={() => {
              // Placeholder action: replace with real checkout URL
              window.open("mailto:sales@example.com?subject=Оплата%20доп%20AI%20запросов", "_blank");
            }}
          >
            Оплатить (связаться)
          </button>
          <button
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            onClick={() => onOpenChange(false)}
          >
            Закрыть
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

