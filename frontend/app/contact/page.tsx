export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-6 py-24 text-center text-slate-700">
      <h1 className="text-3xl font-bold mb-8 text-slate-800">お問い合わせ</h1>

      <p className="text-lg leading-relaxed">
        このホームページに関するお問い合わせは、<br />
        <span className="font-medium text-slate-800">
          kangaku<img
      src="/images/at.gif"
      alt="@"
      className="inline w-[8px] h-[8px] mx-1 align-baseline"
    />list.waseda.jp
        </span>
        <br />
        までお願いいたします。
      </p>

      <p className="mt-4 text-sm text-gray-500">
        （スパムメール防止のため、@マークは画像化または文字置換しています）
      </p>
    </div>
  );
}
