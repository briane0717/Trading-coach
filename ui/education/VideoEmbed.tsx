export function VideoEmbed({
  youtubeId,
  title,
  caption,
}: {
  youtubeId: string;
  title: string;
  caption?: string;
}) {
  return (
    <figure className="video-embed">
      <div className="video-embed-frame">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}`}
          title={title}
          frameBorder={0}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
