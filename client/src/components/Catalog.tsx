type Props = {
  text: string;
  url: string;
  limit: number;
};

export function Catalog({ text, url, limit }: Props) {
  return (
    <div>
      {text}
      {url}
      {limit}
    </div>
  );
}
