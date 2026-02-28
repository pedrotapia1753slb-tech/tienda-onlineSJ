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

    // IMPORTANT: Se DEBE llamar a getUser para que las sesiones recién creadas
    // (login y oauth) refresquen sus cookies y el Servidor se entere en la misma pasada.
    const { data: { user } } = await supabase.auth.getUser()

    // -------------------------------------------------------------
    // PROTECCIÓN DE RUTAS DE ADMINISTRADOR (/admin/*)
    // -------------------------------------------------------------
    if (request.nextUrl.pathname.startsWith('/admin')) {
      if (!user) {
        return NextResponse.redirect(new URL('/auth/login', request.url))
      }

      // Verificar si el usuario tiene el rol is_admin en su perfil
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (!profile?.is_admin) {
        console.warn(`Intento de acceso no autorizado al admin por el usuario: ${user.id}`)
        return NextResponse.redirect(new URL('/', request.url)) // Expulsado al inicio
      }
    }

    // -------------------------------------------------------------
    // PROTECCIÓN DE RUTAS DELIVERY (/delivery/*)
    // -------------------------------------------------------------
    if (request.nextUrl.pathname.startsWith('/delivery')) {
      if (!user) {
        return NextResponse.redirect(new URL('/auth/login', request.url))
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_delivery, is_admin')
        .eq('id', user.id)
        .single()

      if (!profile?.is_delivery && !profile?.is_admin) {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }

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
