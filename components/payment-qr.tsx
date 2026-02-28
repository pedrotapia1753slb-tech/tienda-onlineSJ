'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, Upload, CheckCircle, Copy, HelpCircle } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'

interface PaymentQRProps {
    orderId: string
    totalPrice: number
    onSuccess?: () => void
}

export function PaymentQR({ orderId, totalPrice, onSuccess }: PaymentQRProps) {
    const [uploading, setUploading] = useState(false)
    const [complete, setComplete] = useState(false)
    const router = useRouter()

    // JSON format that some modern apps/readers might interpret technically
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
            const fileExt = file.name.split('.').pop()
            const fileName = `${orderId}-${Math.random()}.${fileExt}`
            const filePath = `proofs/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('payment-proofs')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('payment-proofs')
                .getPublicUrl(filePath)

            // Actualizar el pedido
            const { error: updateError } = await supabase
                .from('orders')
                .update({
                    payment_proof_url: publicUrl,
                    status: 'pending_verification'
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
                <h2 className="text-xl font-bold text-foreground mb-2">Pago enviado</h2>
                <p className="text-muted-foreground mb-6">
                    Tu comprobante ha sido recibido. Verificaremos el pago pronto.
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
                <h2 className="font-serif text-2xl font-bold text-foreground">Guía de Pago</h2>
                <p className="text-sm text-muted-foreground">Completa tu transferencia manualmente</p>
            </div>

            {/* Info de cuenta con botones de copia */}
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

            {/* QR de respaldo */}
            <div className="mb-6 p-4 bg-white rounded-2xl border border-border flex flex-col items-center">
                <QRCodeSVG value={qrValue} size={150} level="M" />
                <p className="text-[9px] text-muted-foreground mt-2 text-center leading-tight">
                    Puedes intentar escanear este QR como referencia mas no todos los bancos lo soportan automáticamente.
                </p>
            </div>

            {/* Upload */}
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
                        className={`flex items-center justify-center gap-2 w-full h-12 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary bg-primary/5 hover:bg-primary/10 transition-all cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {uploading ? (
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        ) : (
                            <Upload className="w-5 h-5 text-primary" />
                        )}
                        <span className="font-medium text-primary">Confirmar Pago (Subir Captura)</span>
                    </Label>
                </div>
                <p className="text-[10px] text-center text-muted-foreground">
                    Sube una captura de pantalla de tu transferencia para confirmar el pedido.
                </p>
            </div>
        </div>
    )
}

