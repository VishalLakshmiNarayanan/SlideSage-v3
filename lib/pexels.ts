export async function fetchPexelsVideo(query: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape&size=medium`,
      {
        headers: {
          Authorization: "LamRUxIDIMIGfhOOurpjmuIhPHQlds2dm8fwfATZcL3vhZtsq6AM2PLI",
        },
      },
    )

    if (!response.ok) {
      console.error("Pexels Video API error:", response.status)
      return null
    }

    const data = await response.json()
    // Get the HD video file (or fallback to smaller sizes)
    const video = data.videos[0]
    if (!video) return null

    const videoFile =
      video.video_files.find((file: any) => file.quality === "hd" || file.quality === "sd") || video.video_files[0]

    return videoFile?.link || null
  } catch (error) {
    console.error("Error fetching Pexels video:", error)
    return null
  }
}

// Keep the image function as fallback
export async function fetchPexelsImage(query: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      {
        headers: {
          Authorization: "LamRUxIDIMIGfhOOurpjmuIhPHQlds2dm8fwfATZcL3vhZtsq6AM2PLI",
        },
      },
    )

    if (!response.ok) {
      console.error("Pexels API error:", response.status)
      return null
    }

    const data = await response.json()
    return data.photos[0]?.src?.large || null
  } catch (error) {
    console.error("Error fetching Pexels image:", error)
    return null
  }
}
