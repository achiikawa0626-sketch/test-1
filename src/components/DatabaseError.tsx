type DatabaseErrorProps = {
  message: string;
};

export function DatabaseError({ message }: DatabaseErrorProps) {
  return (
    <section className="setup-warning">
      <h2>Database is not ready yet</h2>
      <p>{message}</p>
      <p>
        Run the Supabase migrations first. The real chats appear after the tables are created and
        someone sends a question.
      </p>
    </section>
  );
}
