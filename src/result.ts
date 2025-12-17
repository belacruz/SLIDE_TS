export const Result = {
  ok<T>(value: T) {
    return { ok: true, value } as const;
  },

  err(error: string) {
    return { ok: false, error } as const;
  },
};

export type Ok<T> = ReturnType<typeof Result.ok<T>>;
export type Err = ReturnType<typeof Result.err>;

export type Result<T> = Ok<T> | Err;
