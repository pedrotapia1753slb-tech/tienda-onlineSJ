import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Si las variables no existen en Vercel, no rompemos la app con un Error 500
    if (!supabaseUrl || !supabaseKey) {
      console.error('Middleware: Faltan las variables de entorno de Supabase en Vercel.')
      return NextResponse.next()
    }

    let supabaseResponse = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: any[]) {
            cookiesToSet.forEach(({ name, value }: { name: string; value: string }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options?: any }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // Aqui opcionalmente pudieras actualizar la sesion (await supabase.auth.getUser()), 
    // pero si no proteges rutas por defecto, te la puedes ahorrar.

    return supabaseResponse
  } catch (error) {
    // Si algo mas falla, simplemente ignoramos el error y dejamos cargar la pagina sin romper el servidor
    console.error('Middleware crash evitado:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
