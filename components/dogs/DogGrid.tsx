interface DogGridProps {
  children: React.ReactNode;
}

export default function DogGrid({ children }: DogGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {children}
    </div>
  );
}
