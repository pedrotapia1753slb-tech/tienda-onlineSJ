'use client'

import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, Upload, CheckCircle, Copy, HelpCircle, ImageIcon } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface PaymentQRProps {
    orderId: string
    totalPrice: number
    onSuccess?: () => void
}

export function PaymentQR({ orderId, totalPrice, onSuccess }: PaymentQRProps) {
    const [uploading, setUploading] = useState(false)
    const [complete, setComplete] = useState(false)
    const [adminQrUrl, setAdminQrUrl] = useState<string | null>(null)
    const [loadingQr, setLoadingQr] = useState(true)
    const router = useRouter()

    // Load admin QR image from site_settings
    useEffect(() => {
        const supabase = createClient()
        supabase
            .from('site_settings')
            .select('value')
            .eq('key', 'payment_qr_url')
            .single()
            .then(({ data }) => {
                if (data?.value) {
                    setAdminQrUrl(data.value)
                }
                setLoadingQr(false)
            })
    }, [])

    // Fallback QR value if admin hasn't uploaded an image
    const qrValue = JSON.stringify({
        beneficiary: "Samuel Cuba Choque",
        account: "62076035",
        bank: "Banco Ganadero",
        amount: totalPrice,
        currency: "BOB",
        ref: orderId.slice(0, 8)
    })

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text)
        toast.success(`${label} copiado al portapapeles`)
    }

    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const supabase = createClient()

        try {
            // Upload proof to Supabase Storage
            const fileExt = file.name.split('.').pop()
            const fileName = `${orderId}-${Date.now()}.${fileExt}`
            const filePath = `proofs/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('payment-proofs')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('payment-proofs')
                .getPublicUrl(filePath)

            // Update order with proof URL and payment status
            const { error: updateError } = await supabase
                .from('orders')
                .update({
                    payment_proof_url: publicUrl,
                    payment_status: 'pending'
                })
                .eq('id', orderId)

            if (updateError) throw updateError

            setComplete(true)
            toast.success('Comprobante subido correctamente')
            if (onSuccess) onSuccess()
        } catch (error: any) {
            console.error('Error uploading proof:', error)
            toast.error('Error al subir el comprobante: ' + error.message)
        } finally {
            setUploading(false)
        }
    }

    if (complete) {
        return (
            <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="font-serif text-xl font-bold text-foreground mb-2">¡Comprobante enviado!</h2>
                <p className="text-muted-foreground mb-6">
                    Tu comprobante ha sido recibido. Verificaremos el pago pronto y te notificaremos.
                </p>
                <Button onClick={() => router.push('/orders')}>
                    Ir a mis pedidos
                </Button>
            </div>
        )
    }

    return (
        <div className="bg-card border border-border rounded-3xl p-6 max-w-sm mx-auto shadow-sm">
            <div className="text-center mb-6">
                <h2 className="font-serif text-2xl font-bold text-foreground">Realiza tu pago</h2>
                <p className="text-sm text-muted-foreground">Completa tu transferencia y sube el comprobante</p>
            </div>

            {/* Account info with copy buttons */}
            <div className="space-y-3 mb-6">
                <div className="p-3 bg-secondary/50 rounded-2xl border border-border flex items-center justify-between group">
                    <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Monto Total</p>
                        <p className="text-lg font-bold text-foreground">Bs {totalPrice}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(totalPrice.toString(), 'Monto')}>
                        <Copy className="w-4 h-4" />
                    </Button>
                </div>

                <div className="p-3 bg-secondary/50 rounded-2xl border border-border flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Número de Cuenta</p>
                        <p className="text-sm font-mono font-bold text-foreground">62076035</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard('62076035', 'Cuenta')}>
                        <Copy className="w-4 h-4" />
                    </Button>
                </div>

                <div className="p-3 bg-secondary/50 rounded-2xl border border-border flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Titular</p>
                        <p className="text-sm font-bold text-foreground">Samuel Cuba Choque</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard('Samuel Cuba Choque', 'Titular')}>
                        <Copy className="w-4 h-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-2 mt-2 px-1 text-[10px] text-muted-foreground">
                    <HelpCircle className="w-3 h-3 text-primary" />
                    <span>Banco Ganadero (Transferencia directa)</span>
                </div>
            </div>

            {/* QR Code Section */}
            <div className="mb-6 p-4 bg-white rounded-2xl border border-border flex flex-col items-center">
                {loadingQr ? (
                    <div className="flex items-center justify-center h-[180px]">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : adminQrUrl ? (
                    <>
                        <div className="relative w-[200px] h-[200px]">
                            <Image
                                src={adminQrUrl}
                                alt="QR de pago"
                                fill
                                className="object-contain rounded-lg"
                                unoptimized
                            />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-2 text-center leading-tight">
                            Escanea este QR con tu app bancaria para realizar la transferencia.
                        </p>
                    </>
                ) : (
                    <>
                        <QRCodeSVG value={qrValue} size={150} level="M" />
                        <p className="text-[10px] text-muted-foreground mt-2 text-center leading-tight">
                            Puedes intentar escanear este QR como referencia, no todos los bancos lo soportan automáticamente.
                        </p>
                    </>
                )}
            </div>

            {/* Upload proof */}
            <div className="space-y-4">
                <div className="relative">
                    <input
                        type="file"
                        id="proof-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={uploading}
                    />
                    <Label
                        htmlFor="proof-upload"
                        className={`flex items-center justify-center gap-2 w-full h-14 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary bg-primary/5 hover:bg-primary/10 transition-all cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {uploading ? (
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        ) : (
                            <Upload className="w-5 h-5 text-primary" />
                        )}
                        <span className="font-medium text-primary text-sm">
                            {uploading ? 'Subiendo...' : 'Subir comprobante de pago'}
                        </span>
                    </Label>
                </div>
                <p className="text-[10px] text-center text-muted-foreground">
                    Sube una captura de pantalla de tu transferencia para que verifiquemos el pago.
                </p>
            </div>
        </div>
    )
}
