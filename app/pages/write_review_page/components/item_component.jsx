export default function Item(id, name, iconid) {
  return (
    <div className="m-3 p-2 border-[1px] border-divider rounded-md bg-white" key={id}>
      <p>{name}</p>
      <div className="flex text-[#F3B146] relative z-10 place-items-center">
        <iconify-icon icon="clarity:star-solid"></iconify-icon>
        <iconify-icon icon="clarity:star-solid"></iconify-icon>
        <iconify-icon icon="clarity:star-solid"></iconify-icon>
        <iconify-icon icon="clarity:star-solid"></iconify-icon>
        <iconify-icon icon="clarity:star-solid"></iconify-icon>
        <p className="text-bgray font-semibold ml-1">(2134)</p>
      </div>
      <div className="w-full h-28 grid place-content-center relative z-0 overflow-clip">
        <img src={`/write_review/icons/${iconid}.png`} alt="" />
      </div>
    </div>
  );
}
