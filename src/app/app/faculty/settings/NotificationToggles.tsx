"use client";

import { useState, useTransition } from "react";
import { Switch } from "@/components/ui/switch";

interface Item {
  key: "notify_new_offers" | "notify_messages" | "notify_weekly_digest";
  title: string;
  desc: string;
  checked: boolean;
}

export function NotificationToggles({
  items,
  action,
}: {
  items: Item[];
  action: (key: Item["key"], value: boolean) => Promise<void>;
}) {
  const [values, setValues] = useState(
    Object.fromEntries(items.map((i) => [i.key, i.checked])) as Record<Item["key"], boolean>
  );
  const [, startTransition] = useTransition();

  return (
    <div className="divide-y divide-gray-50">
      {items.map((item) => (
        <div key={item.key} className="py-4 flex items-center justify-between gap-8">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-navy">{item.title}</h4>
            <p className="text-xs text-gray-500 font-medium">{item.desc}</p>
          </div>
          <Switch
            checked={values[item.key]}
            onCheckedChange={(checked) => {
              setValues((prev) => ({ ...prev, [item.key]: checked }));
              startTransition(() => {
                action(item.key, checked);
              });
            }}
            className="bg-talentia-blue data-[state=checked]:bg-talentia-blue"
          />
        </div>
      ))}
    </div>
  );
}
