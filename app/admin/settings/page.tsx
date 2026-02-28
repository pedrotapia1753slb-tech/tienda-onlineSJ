'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { QrCode, Upload, Loader2, Trash2, ImageIcon } from 'lucide-react'
import { CldUploadWidget } from 'next-cloudinary'
import Image from 'next/image'

export default function AdminSettingsPage() {
    const [qrUrl, setQrUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        supabase
            .from('site_settings')
            .select('value')
            .eq('key', 'payment_qr_url')
            .single()
            .then(({ data }) => {
                if (data?.value) setQrUrl(data.value)
                setLoading(false)
            })
    }, [])

    async function saveQrUrl(url: string) {
        setSaving(true)
        const { error } = await supabase
            .from('site_settings')
            .upsert({ key: 'payment_qr_url', value: url, updated_at: new Date().toISOString() })

        if (error) {
            console.error(error)
            toast.error('Error al guardar el QR: ' + error.message)
        } else {
            setQrUrl(url)
            toast.success('QR de pago actualizado')
        }
        setSaving(false)
    }

    async function removeQr() {
        const confirm = window.confirm('¿Estás seguro de eliminar el QR de pago?')
        if (!confirm) return

        setSaving(true)
        const { error } = await supabase
            .from('site_settings')
            .delete()
            .eq('key', 'payment_qr_url')

        if (error) {
            toast.error('Error al eliminar: ' + error.message)
        } else {
            setQrUrl(null)
            toast.success('QR de pago eliminado')
        }
        setSaving(false)
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-serif font-bold text-foreground">Configuración</h1>
                <p className="text-muted-foreground mt-1">
                    Administra la configuración general de la tienda.
                </p>
            </div>

            {/* QR Payment Section */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <QrCode className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-foreground">QR de Pago</h2>
                        <p className="text-sm text-muted-foreground">
                            Sube la imagen del código QR que los clientes usarán para realizar pagos por transferencia.
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <>
                        {/* Current QR Preview */}
                        {qrUrl && (
                            <div className="bg-white border border-border rounded-2xl p-6 flex flex-col items-center">
                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-3">QR Actual</p>
                                <div className="relative w-[220px] h-[220px] rounded-xl overflow-hidden border border-border">
                                    <Image
                                        src={qrUrl}
                                        alt="QR de pago actual"
                                        fill
                                        className="object-contain"
                                        unoptimized
                                    />
                                </div>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="mt-4 gap-2"
                                    onClick={removeQr}
                                    disabled={saving}
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Eliminar QR
                                </Button>
                            </div>
                        )}

                        {/* Upload Section */}
                        <CldUploadWidget
                            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                            options={{
                                maxFiles: 1,
                                resourceType: 'image',
                                folder: 'novashop/settings',
                            }}
                            onSuccess={(result: any) => {
                                if (result?.info?.secure_url) {
                                    saveQrUrl(result.info.secure_url)
                                }
                            }}
                        >
                            {({ open }: { open: () => void }) => (
                                <button
                                    type="button"
                                    onClick={() => open()}
                                    disabled={saving}
                                    className="w-full flex flex-col items-center justify-center gap-3 py-8 rounded-2xl border-2 border-dashed border-primary/30 hover:border-primary bg-primary/5 hover:bg-primary/10 transition-all cursor-pointer"
                                >
                                    {saving ? (
                                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <Upload className="w-6 h-6 text-primary" />
                                        </div>
                                    )}
                                    <div className="text-center">
                                        <p className="font-semibold text-sm text-primary">
                                            {qrUrl ? 'Cambiar imagen QR' : 'Subir imagen QR'}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Sube una imagen clara del código QR de tu cuenta bancaria
                                        </p>
                                    </div>
                                </button>
                            )}
                        </CldUploadWidget>

                        {!qrUrl && (
                            <div className="bg-secondary/50 rounded-xl p-3 flex items-start gap-2">
                                <ImageIcon className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                                <p className="text-xs text-muted-foreground">
                                    Sin un QR de pago configurado, los clientes verán un QR generado automáticamente con los datos de tu cuenta bancaria como referencia.
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
