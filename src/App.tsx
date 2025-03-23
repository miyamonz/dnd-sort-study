import { atom, useAtomValue, useSetAtom } from "jotai";

// 簡易的なランダムIDを生成する関数
const generateId = () => Math.random().toString(36).substring(2, 10);

// アイテムの型定義
type Item = {
  id: string;
  text: string;
};

const n = 10; // 要素数を変数で指定
// itemsのリストをatomで定義
const itemsAtom = atom(
  Array.from({ length: n }, (_, i) => ({
    id: generateId(),
    text: `アイテム ${i + 1}`,
  })) satisfies Item[]
);

// ドラッグ関連の状態をatomで管理
const draggedIndexAtom = atom<number | null>(null);
const overIndexAtom = atom<number | null>(null);

// アイテムの並び替えを行うatomアクション
const reorderItemsAtom = atom(
  null,
  (
    get,
    set,
    { sourceIndex, targetIndex }: { sourceIndex: number; targetIndex: number }
  ) => {
    const items = [...get(itemsAtom)];
    const [movedItem] = items.splice(sourceIndex, 1);
    items.splice(targetIndex, 0, movedItem);
    set(itemsAtom, items);
  }
);

function App() {
  const items = useAtomValue(itemsAtom);

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-blue-500 text-white font-bold">
          <h1 className="text-xl">並べ替え可能なリスト</h1>
        </div>
        <ul className="divide-y divide-gray-200">
          {items.map((item, index) => (
            <ItemComponent key={item.id} index={index} item={item} />
          ))}
        </ul>
      </div>
    </div>
  );
}

function ItemComponent({ index, item }: { index: number; item: Item }) {
  const reorderItems = useSetAtom(reorderItemsAtom);
  const draggedIndex = useAtomValue(draggedIndexAtom);
  const setDraggedIndex = useSetAtom(draggedIndexAtom);
  const overIndex = useAtomValue(overIndexAtom);
  const setOverIndex = useSetAtom(overIndexAtom);

  const isDragging = index === draggedIndex;
  const isOver = index === overIndex;

  // ドラッグ開始時のハンドラ
  const handleDragStart = (e: React.DragEvent<HTMLLIElement>) => {
    // ドラッグされたアイテムのインデックスを保存
    setDraggedIndex(index);
    // ドラッグ中の要素の透明度を設定
    e.currentTarget.style.opacity = "0.5";
    // データ転送オブジェクトにインデックスを設定
    e.dataTransfer.setData("text/plain", index.toString());
    e.dataTransfer.effectAllowed = "move";
  };

  // ドラッグ終了時のハンドラ
  const handleDragEnd = (e: React.DragEvent<HTMLLIElement>) => {
    // ドラッグ終了時に要素の透明度を元に戻す
    e.currentTarget.style.opacity = "1";
    setDraggedIndex(null);
    setOverIndex(null);
  };

  // ドラッグオーバー時のハンドラ
  const handleDragOver = (e: React.DragEvent<HTMLLIElement>) => {
    // デフォルトのドラッグオーバー動作を防ぐ
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    // ドラッグオーバー中のインデックスを設定
    setOverIndex(index);
  };

  // ドロップ時のハンドラ
  const handleDrop = (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();

    // ドラッグされたアイテムのインデックスを取得
    const sourceIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);

    if (sourceIndex !== index) {
      // アイテムの並び替えを実行
      reorderItems({ sourceIndex, targetIndex: index });
    }

    // ドラッグ状態をリセット
    setDraggedIndex(null);
    setOverIndex(null);
  };

  return (
    <li
      className={`px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150 flex items-center
        ${isDragging ? "opacity-50 bg-blue-50" : ""}
        ${isOver ? "border-t-2 border-blue-500" : ""}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnter={(e) => e.preventDefault()}
    >
      <DragHandle />
      <div className="mr-3 text-gray-400">{index + 1}.</div>
      <div className="font-medium">{item.text}</div>
    </li>
  );
}

// ドラッグハンドルコンポーネント
function DragHandle() {
  return (
    <div className="flex-shrink-0 mr-3 text-gray-400 cursor-grab">
      <svg
        className="w-5 h-5"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M7 2a1 1 0 011 1v1h4V3a1 1 0 112 0v1h1a2 2 0 012 2v1h-1v6h1v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1h1V8H3V6a2 2 0 012-2h1V3a1 1 0 011-1zm4 5H7v1h4V7z" />
      </svg>
    </div>
  );
}

export default App;
