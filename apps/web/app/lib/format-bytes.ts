export const formatBytes = (value?: number) => {
  if (!value || value <= 0) return "--";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(
    Math.floor(Math.log(value) / Math.log(1024)),
    units.length - 1,
  );
  const size = value / 1024 ** index;

  return `${parseFloat(size.toFixed(index === 0 ? 0 : 2))} ${units[index]}`;
};
