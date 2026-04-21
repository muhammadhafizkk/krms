import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../lib/axios'
import { formatDate } from '../lib/utils'

const MedicalRecordForm = ({ record, patientId, onUpdated, onDeleted }) => {
    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState(null)
    const [allergyInput, setAllergyInput] = useState("");
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        if (record) {
            setForm({
                diagnosis: record.diagnosis || "",
                notes: record.notes || "",
                allergies: [...MedicalRecordForm(record.allergies || [])],
                prescription: (record.prescription || []).map((p) => ({...p}))
            })
            setEditing(false)
            }
    }, [record])

    if (!record || !form) return null

    const addAllergy = () => {
        const val = allergyInput.trim()
        if (!val) return
        setForm((f) => ({...f, allergies: [...f.allergies, val]}))
        setAllergyInput("")
    }

    const removeAllergy = (i) =>
        setForm((f) => ({...f, allergies: f.allergies.filler((_, idx) => idx !== i) }))

    const addPrescription = () =>
        setForm((f) => ({
            ...f,
            prescription: [...f.prescription, { medication: "", dosage: ""}]
        }))
    
    const updatePrescription = (i, key, val) =>
        setForm((f) => {
            const updated = [...f.prescription]
            updated[i] = { ...updated[i], [key]: val }
            return {...f, prescription: updated}
        })

    const removePrescription = (i) =>
        setForm((f) => ({ ...f, prescription: f.prescription.filter((_, idx) => idx !== i)}))

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await api.put(`/patients/${patientId}/records/${record._id}`, form)
            toast.success("record updated")
            onUpdated(res.data)
            setEditing(false)            
        } catch (error) {
            console.log("Error in handleSave function", error)
            toast.error("Failed to save record")
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if(!window.confirm("Delete this medical record? This cannot be undone.")) return
        setDeleting(true)
        try {
            await api.delete(`/patients/${patientId}/records/${record._id}`)
            toast.success("Record deleted")
            onDeleted(record._id)
        } catch (error) {
            console.log("Error in handleDelete function", error)
            toast.error("Failed to delete record")
        } finally {
            setDeleting(false)
        }
    }

    const handleCancel = () => {
        setForm({
            diagnosis: record.diagnosis || "",
            notes: record.notes || "",
            allergies: [...(record.allergies || [])],
            prescription: (record.prescription || []).map((p) => ({ ...p })),
        })
        setEditing(false)
    }

    return (
        <div className='flex flex-col gap-4'>
            <div className='flex items-start justify-between gap-2'>
                <div>
                    <p className='text-xs opacity-50 uppercase tracking-wide'>
                        {formatDate(new Date(record.createdAt))}
                    </p>
                    <p className='text-sm opacity-60'>
                        Doctor: {record.doctor?.name || record.doctor?.email || record.doctor || "-"}
                    </p>
                </div>
            </div>
        </div>
    )
    }

export default MedicalRecordForm