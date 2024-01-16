
import tunnel from "tunnel-rat";

// 物理判定オブジェクト
export const ColliderTunnel = tunnel();

// 動作可能物理判定オブジェクト
export const MoveableColliderTunnel = tunnel();

// 非物理判定オブジェクト
export const NonColliderTunnel = tunnel();

// MultiPlayer内オブジェクト
export const MultiPlayerColliderTunnel = tunnel();