      await setDoc(doc(db, 'customer_enquiries', enquiryId), payload);
      return enquiryReference;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `customer_enquiries/${enquiryId}`);
    }
  };

  const fetchMyCustomerEnquiries = async (): Promise<CustomerEnquiryRecord[]> => {
    if (!auth.currentUser) return [];
    try {
      const q = query(collection(db, 'customer_enquiries'), where('customerUid', '==', auth.currentUser.uid));
      const snap = await getDocs(q);
      const results: CustomerEnquiryRecord[] = [];
      snap.forEach((d) => results.push({ id: d.id, ...d.data() } as CustomerEnquiryRecord));
      return results;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'customer_enquiries');
      return [];
    }
  };

  const fetchAllCustomerEnquiriesAdmin = async (): Promise<CustomerEnquiryRecord[]> => {
    if (!auth.currentUser || !isAdmin) return [];
    try {
      const snap = await getDocs(collection(db, 'customer_enquiries'));
      const results: CustomerEnquiryRecord[] = [];
      snap.forEach((d) => results.push({ id: d.id, ...d.data() } as CustomerEnquiryRecord));
      return results;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'customer_enquiries');
      return [];
    }
  };

  const updateCustomerEnquiryAdmin = async (
    enquiryId: string,
    updates: {
      status?: CustomerEnquiryStatus;
      quotationAmount?: number;
      currency?: string;
      adminResponse?: string;
      adminNotes?: string;
    }
  ) => {
    if (!auth.currentUser || !isAdmin) throw new Error('Unauthorized');
    try {
      const ref = doc(db, 'customer_enquiries', enquiryId);
      const updateData: any = {
        updatedAt: serverTimestamp()
      };
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.quotationAmount !== undefined) updateData.quotationAmount = Number(updates.quotationAmount) || 0;
      if (updates.currency !== undefined) updateData.currency = updates.currency;
      if (updates.adminResponse !== undefined) updateData.adminResponse = updates.adminResponse;
      if (updates.adminNotes !== undefined) updateData.adminNotes = updates.adminNotes;
      await updateDoc(ref, updateData);
      await logAdminActivity('UPDATE_CUSTOMER_ENQUIRY', enquiryId, `Updated customer enquiry ${enquiryId}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `customer_enquiries/${enquiryId}`);
    }
  };

  return (
    <AppDataContext.Provider
      value={{
        user,
        authReady,
        isAdmin,
        settings,
        products,
        allProductsAdmin,
        loadingCatalogue,
        signInAdminWithGoogle,
        signInAdminWithEmail,
        resetAdminPassword,
        signOutAdmin,
        customerSignIn,
        customerSignUp,
        customerSignOut,
        customerResetPassword,
        submitCustomerEnquiry,
        fetchMyCustomerEnquiries,
        fetchAllCustomerEnquiriesAdmin,
        updateCustomerEnquiryAdmin,
        refreshPublicData,
        refreshAdminCatalogue,
        seedInitialCatalogueAndSettings,
        saveBusinessSettings,
        saveProduct,
        removeProduct,
        logAdminActivity
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export function useAppData(): AppDataContextType {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error('useAppData must be used inside AppDataProvider');
  }
  return ctx;
}
