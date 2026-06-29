// Helper central para obtener el usuario "actual" (mock auth)
// En una implementación real, esto usaría NextAuth/getServerSession
// Por ahora devolvemos el primer usuario (cuenta única local)

import { db } from "./db"
import { checkFrameUnlocks } from "./game"
import { PROFILE_ICONS } from "./profile-catalog"

export async function getCurrentUser() {
  let user = await db.user.findFirst()
  if (!user) {
    user = await db.user.create({
      data: {
        name: "Jugador",
        provider: "guest",
      },
    })
  }
  // Auto-unlock marcos e iconos basados en nivel
  await autoUnlockByLevel(user.id, user.level)
  return user
}

export async function autoUnlockByLevel(userId: string, level: number) {
  // Marcos cada 10 niveles
  const frameIds = checkFrameUnlocks(level)
  for (const fid of frameIds) {
    await db.userUnlock.upsert({
      where: { userId_type_key: { userId, type: "frame", key: fid } },
      create: { userId, type: "frame", key: fid },
      update: {},
    })
  }
  // Iconos según thresholds
  for (const icon of PROFILE_ICONS) {
    if (level >= icon.unlockLevel) {
      await db.userUnlock.upsert({
        where: { userId_type_key: { userId, type: "icon", key: icon.id } },
        create: { userId, type: "icon", key: icon.id },
        update: {},
      })
    }
  }
}
