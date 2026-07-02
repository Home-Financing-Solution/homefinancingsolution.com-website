const publicAsset = (fileName: string) =>
  `${import.meta.env.BASE_URL}${fileName.replace(/^\//, "")}`;

export default function TorontoSkylinePhoto() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <video
        autoPlay
        muted
        loop
        playsInline
        poster={publicAsset("toronto-day.png")}
        className="absolute inset-0 w-full h-full object-cover object-center"
        style={{ transform: "scale(1.02)" }}
      >
        <source src={publicAsset("toronto-hero.mp4")} type="video/mp4" />
      </video>
    </div>
  );
}
