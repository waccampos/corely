export function Header({ title }: { title: string }) {
  return (
    <header className="flex items-center justify-center gap-2 p-2 shrink-0">{title}</header>
  );
} 
