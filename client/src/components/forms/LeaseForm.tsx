/*
 * نموذج العقد - رمز الإبداع
 */
import { useState, useEffect, FormEvent } from 'react';
import { FileText, DollarSign, Calendar, User } from 'lucide-react';
import FormModal from './FormModal';
import { FormSection, FormRow, FormInput, FormSelect, FormTextarea } from './FormFields';
import { base44 } from '@/lib/base44Client';

interface LeaseFormProps {
  lease?: any;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

const CONTRACT_TYPES = [
  { value: 'residential', label: 'سكني' },
  { value: 'commercial', label: 'تجاري' },
  { value: 'mixed', label: 'مختلط' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'نشط' },
  { value: 'expired', label: 'منتهي' },
  { value: 'cancelled', label: 'ملغي' },
  { value: 'pending', label: 'قيد الانتظار' },
  { value: 'renewed', label: 'مجدد' },
];

const defaultData = {
  contractNumber: '', versionNumber: '', contractType: 'residential', status: 'active',
  creationDate: '', startDate: '', endDate: '',
  landlordName: '', landlordId: '',
  tenantName: '', tenantNationalId: '', tenantId: '',
  propertyName: '', propertyId: '', propertyType: '',
  unitType: '', unitNumber: '', unitId: '',
  deedNumber: '', city: '', region: '',
  totalContractValue: '', monthlyRent: '', annualRent: '',
  paymentsCount: '', totalDocumentationFees: '', totalSecurityDeposit: '',
  brokerageFees: '', brokerEmployeeName: '', brokerageAgreementNumber: '',
  ejarContractUrl: '', notes: '',
};

export default function LeaseForm({ lease, isOpen, onClose, onSubmit }: LeaseFormProps) {
  const [form, setForm] = useState<any>(lease ? { ...defaultData, ...lease } : { ...defaultData });
  const [loading, setLoading] = useState(false);
  const [tenants, setTenants] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        base44.entities.Tenant.list(),
        base44.entities.Property.list(),
        base44.entities.Unit.list(),
      ]).then(([t, p, u]: any) => { setTenants(t); setProperties(p); setUnits(u); }).catch(() => {});
    }
  }, [isOpen]);

  const set = (name: string, value: any) => {
    if (name === 'tenantId') {
      const t = tenants.find((x: any) => x.id === value);
      setForm((p: any) => ({ ...p, tenantId: value, tenantName: t?.name || '', tenantNationalId: t?.nationalId || '' }));
    } else if (name === 'propertyId') {
      const pr = properties.find((x: any) => x.id === value);
      setForm((p: any) => ({ ...p, propertyId: value, propertyName: pr?.name || '', deedNumber: pr?.deedNumber || '' }));
    } else {
      setForm((p: any) => ({ ...p, [name]: value }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try { await onSubmit(form); onClose(); } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const tenantOpts = tenants.map((t: any) => ({ value: t.id, label: t.name || t.id }));
  const propOpts = properties.map((p: any) => ({ value: p.id, label: p.name || p.id }));
  const unitOpts = units.map((u: any) => ({ value: u.id, label: `${u.unitNumber || u.id} - ${u.propertyName || ''}` }));

  return (
    <FormModal
      title={lease ? 'تعديل العقد' : 'إنشاء عقد جديد'}
      icon={<FileText size={16} className="text-[#C8A951]" />}
      isOpen={isOpen} onClose={onClose} onSubmit={handleSubmit}
      loading={loading} submitLabel={lease ? 'تحديث' : 'إنشاء'} size="lg"
    >
      {/* بيانات العقد */}
      <FormSection title="بيانات العقد" icon={<FileText size={14} />}>
        <FormRow cols={3}>
          <FormInput label="رقم العقد" name="contractNumber" value={form.contractNumber} onChange={set} />
          <FormSelect label="نوع العقد" name="contractType" value={form.contractType} onChange={set} options={CONTRACT_TYPES} />
          <FormSelect label="الحالة" name="status" value={form.status} onChange={set} options={STATUS_OPTIONS} />
        </FormRow>
        <FormRow cols={3}>
          <FormInput label="تاريخ الإنشاء" name="creationDate" value={form.creationDate} onChange={set} type="date" />
          <FormInput label="تاريخ البداية" name="startDate" value={form.startDate} onChange={set} type="date" required />
          <FormInput label="تاريخ النهاية" name="endDate" value={form.endDate} onChange={set} type="date" required />
        </FormRow>
      </FormSection>

      {/* أطراف العقد */}
      <FormSection title="أطراف العقد" icon={<User size={14} />}>
        <FormRow>
          <FormSelect label="المستأجر" name="tenantId" value={form.tenantId} onChange={set} options={tenantOpts} required />
          <FormInput label="هوية المستأجر" name="tenantNationalId" value={form.tenantNationalId} onChange={set} disabled />
        </FormRow>
        <FormRow>
          <FormInput label="اسم المؤجر" name="landlordName" value={form.landlordName} onChange={set} />
          <FormInput label="هوية المؤجر" name="landlordId" value={form.landlordId} onChange={set} />
        </FormRow>
      </FormSection>

      {/* العقار والوحدة */}
      <FormSection title="العقار والوحدة" icon={<Calendar size={14} />}>
        <FormRow>
          <FormSelect label="العقار" name="propertyId" value={form.propertyId} onChange={set} options={propOpts} />
          <FormSelect label="الوحدة" name="unitId" value={form.unitId} onChange={set} options={unitOpts} />
        </FormRow>
        <FormRow>
          <FormInput label="رقم الصك" name="deedNumber" value={form.deedNumber} onChange={set} disabled />
          <FormInput label="رقم الوحدة" name="unitNumber" value={form.unitNumber} onChange={set} />
        </FormRow>
      </FormSection>

      {/* المالية */}
      <FormSection title="البيانات المالية" icon={<DollarSign size={14} />}>
        <FormRow cols={3}>
          <FormInput label="الإيجار الشهري" name="monthlyRent" value={form.monthlyRent} onChange={set} type="number" />
          <FormInput label="الإيجار السنوي" name="annualRent" value={form.annualRent} onChange={set} type="number" />
          <FormInput label="إجمالي قيمة العقد" name="totalContractValue" value={form.totalContractValue} onChange={set} type="number" />
        </FormRow>
        <FormRow cols={3}>
          <FormInput label="عدد الدفعات" name="paymentsCount" value={form.paymentsCount} onChange={set} type="number" />
          <FormInput label="رسوم التوثيق" name="totalDocumentationFees" value={form.totalDocumentationFees} onChange={set} type="number" />
          <FormInput label="التأمين" name="totalSecurityDeposit" value={form.totalSecurityDeposit} onChange={set} type="number" />
        </FormRow>
        <FormRow>
          <FormInput label="رسوم السعي" name="brokerageFees" value={form.brokerageFees} onChange={set} type="number" />
          <FormInput label="اسم موظف الوساطة" name="brokerEmployeeName" value={form.brokerEmployeeName} onChange={set} />
        </FormRow>
      </FormSection>

      <FormTextarea label="ملاحظات" name="notes" value={form.notes} onChange={set} fullWidth />
    </FormModal>
  );
}
