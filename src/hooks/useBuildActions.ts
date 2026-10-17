import { useCallback } from 'react'
import { slotById } from '@/data/catalog'
import { getOption } from '@/lib/configuration'
import { toast, useBuild } from '@/store/build'

/** Select an option, move the camera to the part, and explain blocked choices. */
export function useSelectOption() {
  const select = useBuild((s) => s.select)
  const setCamera = useBuild((s) => s.setCamera)
  return useCallback(
    (optionId: string) => {
      const res = select(optionId)
      if (!res.ok) {
        toast({ title: 'Not available with this build', body: res.reason, tone: 'warning' })
        return false
      }
      const opt = getOption(optionId)
      const cam = opt ? slotById.get(opt.slot)?.camera : undefined
      if (cam && !useBuild.getState().compare) setCamera(cam)
      return true
    },
    [select, setCamera],
  )
}

/** Reset with an undo affordance instead of a blocking confirm. */
export function useResetBuild() {
  return useCallback(() => {
    const prev = useBuild.getState().selections
    useBuild.getState().reset()
    toast({
      title: 'Build reset to factory',
      body: 'All modifications were removed.',
      action: { label: 'Undo', onClick: () => useBuild.getState().restore(prev) },
    })
  }, [])
}
