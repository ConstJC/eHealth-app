'use client';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Printer, 
  Send, 
  Plus, 
  Trash2,
} from "lucide-react";

export default function BillingPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-8rem)]">
      
      {/* Invoice Builder (Left 8 cols) */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Invoice</h1>
          <p className="text-muted-foreground">Billing details for <span className="font-semibold text-foreground">Eleanor Rigby (Visit #1024)</span></p>
        </div>

        <Card className="flex-1 shadow-sm border-border/50 p-0 overflow-hidden flex flex-col bg-white">
          {/* Invoice Header */}
          <div className="p-6 border-b border-border/50 bg-slate-50 flex justify-between items-start">
             <div>
               <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Invoice No</p>
               <p className="text-xl font-mono text-foreground font-semibold">INV-2024-001</p>
             </div>
             <div className="text-right">
               <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Date</p>
               <p className="text-foreground">Oct 24, 2024</p>
             </div>
          </div>

          {/* Items Table */}
          <div className="flex-1 p-6 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border/50">
                  <th className="pb-3 w-[50%]">Description</th>
                  <th className="pb-3 text-center">Qty</th>
                  <th className="pb-3 text-right">Price</th>
                  <th className="pb-3 text-right">Total</th>
                  <th className="pb-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                <InvoiceRow desc="General Consultation" qty={1} price={50.00} />
                <InvoiceRow desc="Paracetamol 500mg" qty={10} price={0.50} />
                <InvoiceRow desc="CBC Lab Test" qty={1} price={25.00} />
              </tbody>
            </table>

            <Button variant="ghost" className="mt-4 text-primary hover:text-primary hover:bg-primary/10 dashed-border w-full border-dashed border">
              <Plus className="h-4 w-4 mr-2" /> Add Item
            </Button>
          </div>

          {/* Footer Totals */}
          <div className="bg-white p-6 border-t border-slate-100">
            <div className="flex flex-col gap-2 max-w-xs ml-auto">
               <div className="flex justify-between text-sm">
                 <span className="text-muted-foreground">Subtotal</span>
                 <span>₱80.00</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-muted-foreground">Tax (10%)</span>
                 <span>₱8.00</span>
               </div>
               <div className="border-t border-slate-100 my-2" />
               <div className="flex justify-between font-bold text-xl text-primary">
                 <span>Total</span>
                 <span>₱88.00</span>
               </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Payment Actions (Right 4 cols) */}
      <div className="lg:col-span-4 space-y-6">
        <h2 className="text-xl font-semibold">Actions</h2>
        
        <Card className="p-5 border-border/50 shadow-sm space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="border-primary bg-primary/5 text-primary">Cash</Button>
              <Button variant="outline">Credit Card</Button>
              <Button variant="outline">Insurance</Button>
              <Button variant="outline">Bank</Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Amount Tendered</label>
            <div className="relative">
              <span className="absolute left-3 top-2 flex h-6 w-6 items-center justify-center font-bold text-slate-400">₱</span>
              <input 
                className="w-full h-10 pl-9 rounded-md border border-input bg-background font-mono font-bold"
                defaultValue="100.00"
              />
            </div>
            <p className="text-xs text-green-600 font-medium">Change Due: ₱12.00</p>
          </div>

          <Button className="w-full h-12 text-lg bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/20">
             Process Payment
          </Button>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="h-12 border-dashed">
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <Button variant="outline" className="h-12 border-dashed">
            <Send className="mr-2 h-4 w-4" /> Email
          </Button>
        </div>
      </div>
    
    </div>
  );
}

function InvoiceRow({ desc, qty, price }: any) {
  return (
    <tr className="group">
      <td className="py-3 font-medium text-foreground">{desc}</td>
      <td className="py-3 text-center">{qty}</td>
      <td className="py-3 text-right font-mono text-muted-foreground">₱{price.toFixed(2)}</td>
      <td className="py-3 text-right font-mono font-medium">₱{(qty * price).toFixed(2)}</td>
      <td className="py-3 text-center">
        <button className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  )
}
