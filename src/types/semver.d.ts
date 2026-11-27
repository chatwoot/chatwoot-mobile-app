declare module 'semver' {
  type SemVer = { version: string };

  const semver: {
    valid: (version: string | SemVer | null | undefined) => string | null;
    coerce: (version: string | null | undefined) => SemVer | null;
    lt: (version: string | SemVer, other: string | SemVer) => boolean;
  };

  export default semver;
}
