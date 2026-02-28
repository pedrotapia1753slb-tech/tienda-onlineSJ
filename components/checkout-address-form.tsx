'use client'

import { useState, useEffect } from 'react'
import { MapPin, Loader2, Navigation, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { OpenLocationCode } from 'open-location-code'

interface CheckoutAddressFormProps {
    address: string
    addressCode: string
    onAddressChange: (address: string) => void
    onAddressCodeChange: (code: string) => void
}

export function CheckoutAddressForm({
    address,
    addressCode,
    onAddressChange,
    onAddressCodeChange,
}: CheckoutAddressFormProps) {
    const [isLocating, setIsLocating] = useState(false)
    const [locationError, setLocationError] = useState('')
    const [accuracyWarning, setAccuracyWarning] = useState('')

    // Auto-detect removed per user request (manual only)

    const detectLocation = () => {
        setIsLocating(true)
        setLocationError('')
        setAccuracyWarning('')

        if (!navigator.geolocation) {
            setLocationError('Tu navegador no soporta geolocalizacion')
            setIsLocating(false)
            toast.error('Geolocalizacion no soportada')
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude, accuracy } = position.coords

                if (accuracy > 1000) {
                    setAccuracyWarning(`Tu navegador nos dio una ubicación muy inexacta (margen de error de ${(accuracy / 1000).toFixed(1)} km). El código generado podría ser de otra ciudad. Por favor, usa tu celular con el GPS encendido para mayor precisión.`)
                } else {
                    setAccuracyWarning('')
                }

                try {
                    // Genera el Plus Code localmente sin APIs externas
                    const olc = new OpenLocationCode() as any
                    const code = olc.encode(latitude, longitude, 10)
                    onAddressCodeChange(code)
                    toast.success('Ubicacion detectada')
                } catch (error) {
                    setLocationError('Error al procesar la ubicacion')
                    toast.error('Error procesando el Plus Code')
                }
                setIsLocating(false)
            },
            (error) => {
                setIsLocating(false)
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        const isHttpObstructed = window.location.protocol !== 'https:' && window.location.hostname !== 'localhost'
                        if (isHttpObstructed) {
                            setLocationError('El navegador bloqueó el GPS porque estás en una red local sin HTTPS. Deberás pegarlo manualmente o probar en Producción (Vercel).')
                        } else {
                            setLocationError('Permiso denegado. Por favor acepta el permiso o pega tu código manualmente.')
                        }
                        break
                    case error.POSITION_UNAVAILABLE:
                        setLocationError('Informacion de ubicacion no disponible.')
                        break
                    case error.TIMEOUT:
                        setLocationError('Tiempo de espera agotado.')
                        break
                    default:
                        setLocationError(
                            window.location.protocol !== 'https:' && window.location.hostname !== 'localhost'
                                ? 'El navegador bloqueó la ubicación porque no se usa HTTPS.'
                                : 'Ocurrio un error desconocido.'
                        )
                        break
                }
                toast.error('No pudimos obtener tu ubicacion GPS')
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        )
    }

    return (
        <div className="space-y-4">
            {/* Direccion Principal Escrita */}
            <div className="space-y-2">
                <Label htmlFor="address" className="text-[#0F172A] font-medium">
                    Dirección de entrega <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="address"
                    name="address"
                    required
                    value={address}
                    onChange={(e) => onAddressChange(e.target.value)}
                    placeholder="Ej: Calle Linares #45, a lado de la farmacia"
                    className="border-border text-[#0F172A] focus-visible:ring-primary/50"
                />
            </div>

            {/* Plus Code de Geolocalizacion */}
            <div className="space-y-2 pt-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-start justify-between">
                    <Label className="text-[#0F172A] font-medium flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#3B82F6]" />
                        Ubicación Exacta (Plus Code)
                    </Label>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={detectLocation}
                        disabled={isLocating}
                        className="h-8 text-[#3B82F6] hover:text-[#3B82F6] hover:bg-blue-50 px-2 flex items-center gap-1.5"
                    >
                        {isLocating ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <Navigation className="w-3.5 h-3.5" />
                        )}
                        <span className="text-xs font-semibold">
                            {addressCode ? 'Actualizar' : 'Detectar'}
                        </span>
                    </Button>
                </div>

                <div className="flex gap-2">
                    <Input
                        value={addressCode || ''}
                        onChange={(e) => onAddressCodeChange(e.target.value.toUpperCase())}
                        placeholder="Ej: 8FVX+H3"
                        className="font-mono text-sm bg-white border-slate-200 text-[#0F172A] focus-visible:ring-primary/50"
                    />
                    {addressCode && addressCode.includes('+') ? (
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            asChild
                            className="shrink-0 text-[#3B82F6] border-slate-200 hover:bg-slate-100"
                            title="Ver en Google Maps"
                        >
                            <a
                                href={`https://plus.codes/${addressCode}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            variant="outline"
                            asChild
                            className="shrink-0 text-slate-600 border-slate-200 hover:bg-slate-100 text-xs px-3 font-medium"
                            title="Buscar mi código en el mapa"
                        >
                            <a
                                href={`https://plus.codes/`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Buscar manual
                            </a>
                        </Button>
                    )}
                </div>

                {accuracyWarning && (
                    <div className="bg-amber-50 text-amber-900 p-3 rounded-lg text-xs border border-amber-200 mt-2">
                        {accuracyWarning}
                    </div>
                )}

                {locationError ? (
                    <p className="text-xs text-destructive mt-1.5">{locationError}</p>
                ) : (
                    <p className="text-xs text-slate-500 mt-1.5">
                        {addressCode
                            ? 'Asegurate de revisar el enlace en Maps para confirmar que sea tu casa.'
                            : 'Se usará tu GPS para ayudar al envío (opcional).'}
                    </p>
                )}
            </div>
        </div>
    )
}
