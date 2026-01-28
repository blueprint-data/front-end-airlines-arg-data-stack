import { useEffect, useState } from "react"

type NetworkInformation = {
  saveData?: boolean
  addEventListener?: (type: "change", listener: () => void) => void
  removeEventListener?: (type: "change", listener: () => void) => void
}

type NavigatorWithConnection = Navigator & {
  connection?: NetworkInformation
}

const getConnection = () => (navigator as NavigatorWithConnection).connection

const getInitialReducedData = () => {
  if (typeof window === "undefined") return false
  const media = window.matchMedia("(prefers-reduced-data: reduce)")
  const connection = getConnection()
  return media.matches || Boolean(connection?.saveData)
}

export function usePrefersReducedData() {
  const [prefersReducedData, setPrefersReducedData] = useState(getInitialReducedData)

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-data: reduce)")
    const connection = getConnection()

    const update = () => {
      const saveData = Boolean(connection?.saveData)
      setPrefersReducedData(media.matches || saveData)
    }

    update()
    media.addEventListener("change", update)
    connection?.addEventListener?.("change", update)

    return () => {
      media.removeEventListener("change", update)
      connection?.removeEventListener?.("change", update)
    }
  }, [])

  return prefersReducedData
}
