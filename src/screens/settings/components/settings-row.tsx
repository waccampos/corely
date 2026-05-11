import { Switch } from "@/components/ui/switch";

export function SettingsRow({
  label,
  desc,
  val,
  onChange,
}: {
  label: string;
  desc?: string;
  val: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center py-3.5 border-b border-zinc-200/60 dark:border-zinc-800/60">
      <div className="flex-1 pr-4">
        <div className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{label}</div>
        {desc && (
          <div className="text-xs text-zinc-500 mt-0.5 leading-snug">{desc}</div>
        )}
      </div>
      <Switch checked={val} onChange={onChange} />
    </div>
  );
}

