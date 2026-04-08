const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

const parseError = async (response: Response) => {
  const body = await response.json().catch(() => null)
  return body?.message || `Request failed (${response.status})`
}

const headers = (token?: string, isJson = true): HeadersInit => ({
  ...(isJson ? { "Content-Type": "application/json" } : {}),
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
})

export const http = {
  async get<T>(path: string, token?: string): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
      headers: headers(token),
    })

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("accessToken")
      }
      throw new Error(await parseError(response))
    }

    return response.json() as Promise<T>
  },

  async post<T>(path: string, data: unknown, token?: string): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: headers(token),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("accessToken")
      }
      throw new Error(await parseError(response))
    }

    return response.json() as Promise<T>
  },

  async put<T>(path: string, data: unknown, token?: string): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
      method: "PUT",
      headers: headers(token),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("accessToken")
      }
      throw new Error(await parseError(response))
    }

    return response.json() as Promise<T>
  },

  async patch<T>(path: string, data: unknown, token?: string): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
      method: "PATCH",
      headers: headers(token),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("accessToken")
      }
      throw new Error(await parseError(response))
    }

    return response.json() as Promise<T>
  },

  async delete<T>(path: string, token?: string): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
      method: "DELETE",
      headers: headers(token),
    })

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("accessToken")
      }
      throw new Error(await parseError(response))
    }

    return response.json() as Promise<T>
  },

  async postFormData<T>(path: string, formData: FormData, token?: string): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: headers(token, false),
      body: formData,
    })

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("accessToken")
      }
      throw new Error(await parseError(response))
    }

    return response.json() as Promise<T>
  },

  async putFormData<T>(path: string, formData: FormData, token?: string): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
      method: "PUT",
      headers: headers(token, false),
      body: formData,
    })

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("accessToken")
      }
      throw new Error(await parseError(response))
    }

    return response.json() as Promise<T>
  },
}
