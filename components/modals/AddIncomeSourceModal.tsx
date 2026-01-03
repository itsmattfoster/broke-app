import React, { useState } from 'react';
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

interface AddIncomeSourceModalProps {
  visible: boolean;
  onClose: () => void;
}

const FREQUENCIES = ['once', 'biweekly', 'monthly'] as const;
const FREQUENCY_LABELS: Record<string, string> = {
  once: 'Single',
  biweekly: 'Biweekly',
  monthly: 'Monthly',
};

export const AddIncomeSourceModal: React.FC<AddIncomeSourceModalProps> = ({ 
  visible, 
  onClose,
}) => {
  const { addIncomeSource } = useAppStore();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedFrequency, setSelectedFrequency] = useState<string>('');
  const [isFrequencyDropdownOpen, setIsFrequencyDropdownOpen] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !selectedFrequency || !amount.trim()) return;

    await addIncomeSource({
      name: name.trim(),
      amount: parseFloat(amount),
      frequency: selectedFrequency as 'once' | 'biweekly' | 'monthly',
      lastReceived: new Date(),
      icon: '💰', // Default icon, could be customizable later
    });

    // Reset form
    setName('');
    setAmount('');
    setSelectedFrequency('');
    lightHaptic();
    onClose();
  };

  const handleClose = () => {
    setName('');
    setAmount('');
    setSelectedFrequency('');
    onClose();
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
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>New Income Source</Text>
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
          {/* Name Field */}
          <View style={styles.field}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter income source name"
              placeholderTextColor="#999999"
            />
          </View>

          {/* Amount Field */}
          <View style={styles.field}>
            <Text style={styles.label}>Amount</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor="#999999"
              keyboardType="decimal-pad"
            />
          </View>

          {/* Frequency Field (in same position as Category) */}
          <View style={styles.field}>
            <Text style={styles.label}>Payment Type</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => {
                lightHaptic();
                setIsFrequencyDropdownOpen(!isFrequencyDropdownOpen);
              }}
            >
              <Text style={[styles.dropdownText, !selectedFrequency && styles.placeholder]}>
                {selectedFrequency ? FREQUENCY_LABELS[selectedFrequency] : 'Select payment type'}
              </Text>
              <Ionicons 
                name={isFrequencyDropdownOpen ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#666666" 
              />
            </TouchableOpacity>
            {isFrequencyDropdownOpen && (
              <View style={styles.dropdownList}>
                {FREQUENCIES.map((frequency) => (
                  <TouchableOpacity
                    key={frequency}
                    style={styles.dropdownItem}
                    onPress={() => {
                      lightHaptic();
                      setSelectedFrequency(frequency);
                      setIsFrequencyDropdownOpen(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{FREQUENCY_LABELS[frequency]}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              (!name.trim() || !amount.trim() || !selectedFrequency) && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!name.trim() || !amount.trim() || !selectedFrequency}
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

