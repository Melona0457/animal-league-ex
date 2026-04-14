type NavigatorConnection = {
  saveData?: boolean;
  effectiveType?: string;
};

type NavigatorWithConnection = Navigator & {
  connection?: NavigatorConnection;
};

export function isConstrainedMediaDevice() {
  if (typeof window === "undefined") {
    return false;
  }

  const isMobileViewport = window.matchMedia("(max-width: 768px)").matches;
  const connection = (navigator as NavigatorWithConnection).connection;
  const saveData = connection?.saveData ?? false;
  const effectiveType = connection?.effectiveType?.toLowerCase() ?? "";
  const isSlowConnection = effectiveType.includes("2g") || effectiveType.includes("3g");

  return isMobileViewport || saveData || isSlowConnection;
}
