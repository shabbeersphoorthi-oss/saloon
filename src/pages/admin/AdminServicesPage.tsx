import React, { useState } from 'react';
import { useSalon } from '../../context/SalonContext';
import { Service, ServiceCategory } from '../../types/salon';
import { ServiceTable } from '../../components/admin/ServiceTable';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Plus } from 'lucide-react';

export const AdminServicesPage: React.FC = () => {
  const { services, addService, updateService, deleteService, toggleServiceActive } = useSalon();

  // Modal form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Delete dialog state
  const [deletingService, setDeletingService] = useState<Service | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ServiceCategory>('Hair');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState<number>(30);
  const [price, setPrice] = useState<number>(300);
  const [discountPrice, setDiscountPrice] = useState<string>('');
  const [image, setImage] = useState('');
  const [active, setActive] = useState<boolean>(true);
  const [featured, setFeatured] = useState<boolean>(false);
  const [homeVisitAvailable, setHomeVisitAvailable] = useState<boolean>(true);

  const handleOpenAdd = () => {
    setEditingService(null);
    setName('');
    setCategory('Hair');
    setDescription('');
    setDuration(30);
    setPrice(300);
    setDiscountPrice('');
    setImage('https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=600&q=80');
    setActive(true);
    setFeatured(false);
    setHomeVisitAvailable(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (srv: Service) => {
    setEditingService(srv);
    setName(srv.name);
    setCategory(srv.category);
    setDescription(srv.description);
    setDuration(srv.duration);
    setPrice(srv.price);
    setDiscountPrice(srv.discountPrice ? String(srv.discountPrice) : '');
    setImage(srv.image);
    setActive(srv.active);
    setFeatured(Boolean(srv.featured));
    setHomeVisitAvailable(srv.homeVisitAvailable ?? true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedDiscount = discountPrice ? parseFloat(discountPrice) : undefined;

    if (editingService) {
      const updated: Service = {
        ...editingService,
        name: name.trim(),
        category,
        description: description.trim(),
        duration: Number(duration),
        price: Number(price),
        discountPrice: parsedDiscount,
        image: image.trim(),
        active,
        featured,
        homeVisitAvailable,
      };
      await updateService(updated);
    } else {
      await addService({
        name: name.trim(),
        category,
        description: description.trim(),
        duration: Number(duration),
        price: Number(price),
        discountPrice: parsedDiscount,
        image: image.trim(),
        active,
        featured,
        homeVisitAvailable,
      });
    }

    setIsModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!deletingService) return;
    await deleteService(deletingService.id);
    setDeletingService(null);
  };

  return (
    <div className="space-y-6 p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 font-luxury">
            Services & Pricing Management
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Modify menu catalog, adjust Indian Rupee rates, update durations, or toggle service availability.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 rounded-xl bg-stone-900 text-[#E2B755] font-bold text-xs hover:bg-black transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
        >
          <Plus size={16} />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Services Table/Cards */}
      <ServiceTable
        services={services}
        onAddService={handleOpenAdd}
        onEditService={handleOpenEdit}
        onDeleteService={srv => setDeletingService(srv)}
        onToggleActive={toggleServiceActive}
      />

      {/* Add / Edit Service Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingService ? 'Edit Service' : 'Add New Service'}
        subtitle="Changes are immediately reflected in customer booking menu"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Service Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Royal Shave"
                className="w-full px-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ServiceCategory)}
                className="w-full px-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40"
              >
                <option value="Hair">Hair</option>
                <option value="Grooming">Grooming</option>
                <option value="Skin & Facial">Skin & Facial</option>
                <option value="Packages">Packages</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
              Description *
            </label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detailed treatment description for customers..."
              className="w-full px-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Duration (Mins) *
              </label>
              <input
                type="number"
                min={10}
                max={240}
                step={5}
                required
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                className="w-full px-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Regular Price (₹) *
              </label>
              <input
                type="number"
                min={0}
                required
                value={price}
                onChange={e => setPrice(Number(e.target.value))}
                className="w-full px-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Discount Price (₹)
              </label>
              <input
                type="number"
                min={0}
                placeholder="Optional"
                value={discountPrice}
                onChange={e => setDiscountPrice(e.target.value)}
                className="w-full px-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
              Image URL *
            </label>
            <input
              type="url"
              required
              value={image}
              onChange={e => setImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40"
            />
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
              <input
                type="checkbox"
                checked={active}
                onChange={e => setActive(e.target.checked)}
                className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
              />
              <span>Active on customer menu</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
              <input
                type="checkbox"
                checked={featured}
                onChange={e => setFeatured(e.target.checked)}
                className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
              />
              <span>Feature on homepage</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              <input
                type="checkbox"
                checked={homeVisitAvailable}
                onChange={e => setHomeVisitAvailable(e.target.checked)}
                className="rounded border-emerald-400 text-emerald-700 focus:ring-emerald-600"
              />
              <span>🏠 Home Visit Available</span>
            </label>
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-stone-900 text-[#E2B755] hover:bg-black transition-colors"
            >
              {editingService ? 'Save Changes' : 'Create Service'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingService)}
        onClose={() => setDeletingService(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Service?"
        message={`Are you sure you want to permanently remove "${deletingService?.name}" from Bloom Saloon?`}
        confirmLabel="Yes, Delete Service"
        isDestructive={true}
      />
    </div>
  );
};
