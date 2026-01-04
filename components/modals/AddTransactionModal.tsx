import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { lightHaptic } from '../../lib/haptics';
import type { Transaction } from '../../types';

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  isSchoolTransaction?: boolean;
  transaction?: Transaction | null;
}

const CATEGORIES = [
  'Food',
  'Shopping',
  'Transportation',
  'Self Care',
  'Entertainment',
  'Subscriptions',
  'Other',
];

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ 
  visible, 
  onClose,
  isSchoolTransaction = false,
  transaction = null,
}) => {
  const { addTransaction, updateTransaction, budgets } = useAppStore();
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'flex' | 'swipe'>(
    isSchoolTransaction ? 'flex' : 'cash'
  );
  
  // Swipe-down-to-dismiss tracking for web
  const [swipeStartY, setSwipeStartY] = useState<number | null>(null);
  const [swipeCurrentY, setSwipeCurrentY] = useState<number | null>(null);

  // Populate form when editing
  useEffect(() => {
    if (transaction) {
      setMerchant(transaction.merchant);
      setAmount(transaction.paymentMethod === 'swipe' ? '' : transaction.amount.toString());
      setSelectedCategory(transaction.category);
      setPaymentMethod(transaction.paymentMethod || 'cash');
    } else {
      // Reset form when creating new
      setMerchant('');
      setAmount('');
      setSelectedCategory('');
      setPaymentMethod(isSchoolTransaction ? 'flex' : 'cash');
    }
  }, [transaction, isSchoolTransaction]);

  const handleSave = async () => {
    if (!merchant.trim() || !selectedCategory) return;
    // Don't require amount if it's a swipe
    if (paymentMethod !== 'swipe' && !amount.trim()) return;

    const categoryBudget = budgets.find(b => b.category === selectedCategory);
    const icon = categoryBudget?.icon || transaction?.icon || '💰';

    if (transaction) {
      // Update existing transaction
      await updateTransaction(transaction.id, {
        merchant: merchant.trim(),
        amount: paymentMethod === 'swipe' ? 0 : parseFloat(amount),
        category: selectedCategory,
        date: transaction.date, // Keep original date
        icon,
        paymentMethod: paymentMethod === 'swipe' ? 'swipe' : paymentMethod,
      });
    } else {
      // Create new transaction
    await addTransaction({
      merchant: merchant.trim(),
      amount: paymentMethod === 'swipe' ? 0 : parseFloat(amount),
      category: selectedCategory,
      type: 'spend',
      date: new Date(),
      needsReview: true,
      icon,
      paymentMethod: paymentMethod === 'swipe' ? 'swipe' : paymentMethod,
    });
    }

    // Reset form
    setMerchant('');
    setAmount('');
    setSelectedCategory('');
    setPaymentMethod(isSchoolTransaction ? 'flex' : 'cash');
    lightHaptic();
    onClose();
  };

  const handleClose = () => {
    setMerchant('');
    setAmount('');
    setSelectedCategory('');
    setPaymentMethod(isSchoolTransaction ? 'flex' : 'cash');
    onClose();
  };

  // Swipe-down-to-dismiss handlers for web
  const handleSwipeStart = (e: any) => {
    if (Platform.OS !== 'web') return;
    const touch = e.nativeEvent?.touches?.[0];
    const startY = touch ? touch.pageY : e.nativeEvent?.pageY;
    if (startY) {
      setSwipeStartY(startY);
      setSwipeCurrentY(startY);
    }
  };

  const handleSwipeMove = (e: any) => {
    if (Platform.OS !== 'web' || swipeStartY === null) return;
    const touch = e.nativeEvent?.touches?.[0];
    const currentY = touch ? touch.pageY : e.nativeEvent?.pageY;
    if (currentY && currentY > swipeStartY) { // Only allow downward swipes
      setSwipeCurrentY(currentY);
    }
  };

  const handleSwipeEnd = () => {
    if (Platform.OS !== 'web' || swipeStartY === null || swipeCurrentY === null) {
      setSwipeStartY(null);
      setSwipeCurrentY(null);
      return;
    }
    
    const deltaY = swipeCurrentY - swipeStartY;
    const minSwipeDistance = 100; // Minimum distance to dismiss
    
    if (deltaY > minSwipeDistance) {
      handleClose();
    }
    
    setSwipeStartY(null);
    setSwipeCurrentY(null);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        onTouchStart={Platform.OS === 'web' ? handleSwipeStart : undefined}
        onTouchMove={Platform.OS === 'web' ? handleSwipeMove : undefined}
        onTouchEnd={Platform.OS === 'web' ? handleSwipeEnd : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{transaction ? 'Edit Transaction' : 'New Transaction'}</Text>
          <TouchableOpacity 
            onPress={() => {
              lightHaptic();
              handleClose();
            }}
          >
            <Ionicons name="close" size={24} color="#000000" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {/* Merchant/Name Field */}
          <View style={styles.field}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={merchant}
              onChangeText={setMerchant}
              placeholder="Enter merchant name"
              placeholderTextColor="#999999"
            />
          </View>

          {/* Price Field */}
          <View style={styles.field}>
            <Text style={styles.label}>Price</Text>
            <TextInput
              style={[styles.input, paymentMethod === 'swipe' && styles.inputDisabled]}
              value={paymentMethod === 'swipe' ? 'Meal Swipe' : amount}
              onChangeText={setAmount}
              placeholder={paymentMethod === 'swipe' ? 'Meal Swipe' : '0.00'}
              placeholderTextColor="#999999"
              keyboardType="decimal-pad"
              editable={paymentMethod !== 'swipe'}
            />
          </View>

          {/* Category Field */}
          <View style={styles.field}>
            <Text style={styles.label}>Category</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => {
                lightHaptic();
                setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
              }}
            >
              <Text style={[styles.dropdownText, !selectedCategory && styles.placeholder]}>
                {selectedCategory || 'Select category'}
              </Text>
              <Ionicons 
                name={isCategoryDropdownOpen ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#666666" 
              />
            </TouchableOpacity>
            {isCategoryDropdownOpen && (
              <View style={styles.dropdownList}>
                {CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={styles.dropdownItem}
                    onPress={() => {
                      lightHaptic();
                      setSelectedCategory(category);
                      setIsCategoryDropdownOpen(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{category}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Payment Method Field */}
          <View style={styles.field}>
            <Text style={styles.label}>Payment Method</Text>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  paymentMethod === (isSchoolTransaction ? 'flex' : 'cash') && styles.toggleButtonActive,
                ]}
                onPress={() => {
                  lightHaptic();
                  setPaymentMethod(isSchoolTransaction ? 'flex' : 'cash');
                }}
              >
                <Text style={[
                  styles.toggleButtonText,
                  paymentMethod === (isSchoolTransaction ? 'flex' : 'cash') && styles.toggleButtonTextActive,
                ]}>
                  {isSchoolTransaction ? 'Flex' : 'Cash'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  paymentMethod === (isSchoolTransaction ? 'swipe' : 'flex') && styles.toggleButtonActive,
                ]}
                onPress={() => {
                  lightHaptic();
                  setPaymentMethod(isSchoolTransaction ? 'swipe' : 'flex');
                }}
              >
                <Text style={[
                  styles.toggleButtonText,
                  paymentMethod === (isSchoolTransaction ? 'swipe' : 'flex') && styles.toggleButtonTextActive,
                ]}>
                  {isSchoolTransaction ? 'Swipe' : 'Flex'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              (!merchant.trim() || (!amount.trim() && paymentMethod !== 'swipe') || !selectedCategory) && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!merchant.trim() || (!amount.trim() && paymentMethod !== 'swipe') || !selectedCategory}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputDisabled: {
    backgroundColor: '#F5F5F5',
    color: '#999999',
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dropdownText: {
    fontSize: 16,
    color: '#000000',
  },
  placeholder: {
    color: '#999999',
  },
  dropdownList: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#000000',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
  },
  toggleButtonTextActive: {
    color: '#000000',
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  saveButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

