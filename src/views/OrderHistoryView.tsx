import React, { useState, useEffect } from 'react';
import { ActiveView, CartItem } from '../types';
import { MOCK_ORDERS } from '../data/mockData';
import { orderService, LiveOrder, SmsLogEntry, LOKOCHOP_SUPPORT_WHATSAPP } from '../services/orderService';
import { 
  ShoppingBag, 
  Clock, 
  MapPin, 
  ChevronRight, 
  MessageCircle, 
  Phone, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowRight,
  ShieldCheck,
  Receipt,
  RotateCw,
  Send,
  Bike
} from 'lucide-react';

interface OrderHistoryViewProps {
  onNavigate: (view: ActiveView) => void;
  onReorder?: (items: CartItem[]) => void;
}

export const OrderHistoryView: React.FC<OrderHistoryViewProps> = ({ onNavigate, onReorder }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'delivered' | 'sms_logs'>('all');
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [liveOrders, setLiveOrders] = useState<LiveOrder[]>([]);
  const [smsLogs, setSmsLogs] = useState<SmsLogEntry[]>([]);
  const [reorderSuccessMsg, setReorderSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsub = orderService.subscribeToAllOrders((all) => {
      setLiveOrders(all);
    });
    setSmsLogs(orderService.getSmsLogs());
    return () => unsub();
  }, []);

  // Format and merge mock orders with live orders
  const allOrdersList = [
    ...liveOrders.map(lo => ({
      id: lo.id,
      vendorName: lo.vendorName,
      vendorPhone: lo.vendorPhone,
      status: lo.kitchenStatus === 'delivered' 
        ? 'delivered' 
        : (lo.paymentStatus === 'customer_confirmed' || lo.kitchenStatus === 'cooking' || lo.kitchenStatus === 'dispatched' 
            ? 'in_kitchen' 
            : 'awaiting_payment'),
      totalAmount: lo.totalAmount,
      deliveryFee: lo.dispatchFee || 800,
      tier: 'Tier 1' as const,
      destination: lo.destination,
      createdAt: new Date(lo.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
      paymentStatus: lo.paymentStatus,
      kitchenStatus: lo.kitchenStatus,
      riderName: lo.riderName,
      bankDetails: lo.bankDetails,
      items: lo.items.map(it => ({
        id: it.id,
        name: it.name,
        price: it.price,
        quantity: it.quantity
      }))
    })),
    ...MOCK_ORDERS
  ];

  const filteredOrders = allOrdersList.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return order.status === 'awaiting_payment' || order.status === 'in_kitchen';
    if (activeTab === 'delivered') return order.status === 'delivered';
    return true;
  });

  const handleReorderClick = (items: { id: string; name: string; price: number; quantity: number }[]) => {
    const cartFormat: CartItem[] = items.map(it => ({
      id: it.id || `re-${Date.now()}`,
      name: it.name,
      price: it.price,
      quantity: it.quantity
    }));

    if (onReorder) {
      onReorder(cartFormat);
      setReorderSuccessMsg('Dishes added to your cart! Review vendor account details to transfer.');
      setTimeout(() => setReorderSuccessMsg(null), 4000);
    } else {
      onNavigate('marketplace');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6 pb-16">
      
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-on-surface-variant text-xs mb-2">
        <button onClick={() => onNavigate('marketplace')} className="hover:text-primary transition-colors cursor-pointer">
          Marketplace
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-outline" />
        <span className="text-primary font-bold">My Orders &amp; Dispute Desk</span>
      </nav>

      {/* Customer Profile Header */}
      <div className="bg-surface-container rounded-2xl border border-outline-variant/30 p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary-container text-on-primary font-headline font-bold text-xl flex items-center justify-center">
            AU
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-headline text-2xl font-bold text-on-surface">Amina Usman</h1>
              <span className="bg-tertiary/15 text-tertiary text-[11px] font-bold px-2 py-0.5 rounded-full">
                Loyal Foodie
              </span>
            </div>
            <p className="text-xs text-on-surface-variant flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              House 14, Phase 1 Lokongoma, Lokoja &bull; 0803 123 4567
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button 
            onClick={() => onNavigate('order-tracking')}
            className="px-4 py-2.5 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Clock className="w-4 h-4" />
            <span>Track Live Order</span>
          </button>
          <a
            href={`https://wa.me/${LOKOCHOP_SUPPORT_WHATSAPP.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface text-on-surface hover:bg-surface-container-high text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-tertiary" />
            <span>Support Desk</span>
          </a>
        </div>
      </div>

      {/* Reorder Success Alert Banner */}
      {reorderSuccessMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{reorderSuccessMsg}</span>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scroll text-xs">
        {[
          { id: 'all', label: `All Orders (${allOrdersList.length})` },
          { id: 'active', label: `Active (${allOrdersList.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length})` },
          { id: 'delivered', label: `Delivered (${allOrdersList.filter(o => o.status === 'delivered').length})` },
          { id: 'sms_logs', label: `SMS Dispatches (${smsLogs.length})` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'bg-primary text-white shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SMS Logs Tab Content */}
      {activeTab === 'sms_logs' ? (
        <div className="bg-surface-container rounded-2xl border border-outline-variant/30 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
            <div>
              <h3 className="font-headline font-bold text-base text-on-surface flex items-center gap-2">
                <Send className="w-4 h-4 text-primary" />
                SMS Low-Data Delivery Alerts (Termii Nigeria Gateway)
              </h3>
              <p className="text-xs text-on-surface-variant">
                Automatic SMS dispatches sent to your phone when you are in low internet zones in Lokoja.
              </p>
            </div>
          </div>

          <div className="divide-y divide-outline-variant/20">
            {smsLogs.length === 0 ? (
              <div className="py-8 text-center text-xs text-on-surface-variant">
                No SMS delivery notices dispatched yet. SMS notifications are triggered automatically when orders are confirmed or rider begins delivery.
              </div>
            ) : (
              smsLogs.map(log => (
                <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-primary">#{log.orderId}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold">
                        {log.gateway}
                      </span>
                    </div>
                    <p className="text-on-surface mt-1 font-medium">{log.message}</p>
                  </div>
                  <span className="text-[11px] text-on-surface-variant shrink-0">
                    {new Date(log.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Orders List */
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <article 
              key={order.id} 
              className="bg-surface-container rounded-2xl border border-outline-variant/30 p-5 md:p-6 space-y-4 shadow-xs"
            >
              
              {/* Order Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/15 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-headline font-bold text-base text-on-surface">
                        {order.vendorName}
                      </span>
                      <span className="font-mono text-xs text-on-surface-variant">
                        #{order.id}
                      </span>
                    </div>
                    <span className="text-[11px] text-on-surface-variant">
                      Placed on {order.createdAt}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  {order.status === 'awaiting_payment' && (
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-700" /> Awaiting Vendor Verification
                    </span>
                  )}
                  {order.status === 'in_kitchen' && (
                    <span className="px-2.5 py-1 rounded-full bg-primary/15 text-primary font-bold text-[11px] flex items-center gap-1">
                      <RotateCw className="w-3 h-3 animate-spin" /> 
                      {order.kitchenStatus === 'dispatched' ? 'On Confluence Bike' : 'Verified & Cooking'}
                    </span>
                  )}
                  {order.status === 'delivered' && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-bold text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Delivered Hot
                    </span>
                  )}
                </div>
              </div>

              {/* Order Items & Amounts */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                <div className="lg:col-span-8 space-y-2">
                  <div className="divide-y divide-outline-variant/10 text-xs">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="py-1 flex items-center justify-between">
                        <span className="font-medium text-on-surface">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="font-price-display font-semibold text-on-surface">
                          ₦{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-on-surface-variant pt-1 flex-wrap">
                    <span>Dispatch: <strong>₦{order.deliveryFee}</strong> ({order.tier})</span>
                    <span>Destination: <strong>{order.destination}</strong></span>
                    {order.riderName && (
                      <span className="text-primary font-semibold flex items-center gap-1">
                        <Bike className="w-3 h-3" /> Rider: {order.riderName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-4 flex flex-col sm:items-end justify-center gap-2 border-t lg:border-t-0 lg:border-l border-outline-variant/15 pt-3 lg:pt-0 lg:pl-6">
                  <div>
                    <span className="text-[10px] text-on-surface-variant uppercase block sm:text-right">Total Transferred</span>
                    <span className="font-price-display text-2xl font-bold text-primary block sm:text-right">
                      ₦{order.totalAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    {order.status !== 'delivered' ? (
                      <button
                        onClick={() => onNavigate('order-tracking')}
                        className="px-4 py-2 rounded-lg bg-primary-container text-on-primary text-xs font-bold hover:bg-primary transition-colors cursor-pointer"
                      >
                        Track Order Live
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReorderClick(order.items)}
                        className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1"
                      >
                        <RotateCw className="w-3 h-3" />
                        <span>Re-order Meal</span>
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedReceipt(selectedReceipt === order.id ? null : order.id)}
                      className="p-2 rounded-lg border border-outline-variant/30 text-on-surface-variant hover:text-on-surface text-xs cursor-pointer"
                      title="View e-Receipt"
                    >
                      <Receipt className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Collapsible e-Receipt */}
              {selectedReceipt === order.id && (
                <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
                    <span className="font-headline font-bold text-on-surface">Official LokoChop e-Receipt</span>
                    <span className="font-mono text-[11px] text-tertiary">REF: LKCP-{order.id}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div><span className="text-on-surface-variant">Vendor Bank:</span> {order.bankDetails?.bankName || 'First Bank of Nigeria'}</div>
                    <div><span className="text-on-surface-variant">Account:</span> {order.bankDetails?.accountName || order.vendorName} ({order.bankDetails?.accountNumber || '3089421570'})</div>
                    <div><span className="text-on-surface-variant">Payment Method:</span> Direct Bank Transfer (NIP)</div>
                    <div><span className="text-on-surface-variant">Dispute Coverage:</span> 100% Protected via WhatsApp Desk</div>
                  </div>
                </div>
              )}

            </article>
          ))}
        </div>
      )}

      {/* Direct WhatsApp Dispute Desk Card */}
      <section className="bg-surface-container rounded-2xl border-2 border-tertiary/30 p-6 md:p-8 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-tertiary font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>Confluence Consumer Trust Guarantee</span>
            </div>
            <h2 className="font-headline text-2xl font-bold text-on-surface">
              Direct Lokoja Dispute Desk &amp; Instant Resolution
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl leading-relaxed">
              Did your bank debit without status confirmation? Was soup spilled on transit, or is the rider delayed on the Meme bridge corridor? Our dedicated Lokoja desk handles escalations in under 5 minutes on WhatsApp.
            </p>
          </div>

          <a
            href={`https://wa.me/${LOKOCHOP_SUPPORT_WHATSAPP.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-tertiary hover:bg-tertiary/90 text-on-tertiary font-headline font-bold text-sm px-6 py-3.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Open WhatsApp Desk ({LOKOCHOP_SUPPORT_WHATSAPP})</span>
          </a>
        </div>

        {/* Quick Issue Prompts */}
        <div className="pt-4 border-t border-outline-variant/20 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-on-surface-variant font-medium">Fast Resolution Prompts:</span>
          <a
            href={`https://wa.me/${LOKOCHOP_SUPPORT_WHATSAPP.replace(/\D/g, '')}?text=Hello%20LokoChop%20Desk,%20my%20bank%20was%20debited%20for%20an%20order%20but%20transfer%20is%20still%20pending.`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-full bg-surface-container-lowest border border-outline-variant/30 hover:border-tertiary text-on-surface transition-colors"
          >
            ⏱ Delayed Bank Transfer Verification
          </a>
          <a
            href={`https://wa.me/${LOKOCHOP_SUPPORT_WHATSAPP.replace(/\D/g, '')}?text=Hello%20LokoChop%20Desk,%20I%20have%20an%20issue%20with%20spilled%20soup%20or%20missing%20items%20in%20my%20order.`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-full bg-surface-container-lowest border border-outline-variant/30 hover:border-tertiary text-on-surface transition-colors"
          >
            🍲 Food Quality / Spilled Soup Issue
          </a>
          <a
            href={`https://wa.me/${LOKOCHOP_SUPPORT_WHATSAPP.replace(/\D/g, '')}?text=Hello%20LokoChop%20Desk,%20my%20rider%20needs%20assistance%20locating%20my%20address%20in%20Phase%201%20Lokongoma.`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-full bg-surface-container-lowest border border-outline-variant/30 hover:border-tertiary text-on-surface transition-colors"
          >
            🏍 Rider Address Assistance
          </a>
        </div>
      </section>

    </div>
  );
};
