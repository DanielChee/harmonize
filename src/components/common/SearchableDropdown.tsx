/**
 * Searchable Dropdown Component
 * A searchable dropdown input for selecting from a list of options
 */

import { COLORS, SPACING, TYPOGRAPHY } from '@constants';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface SearchableDropdownProps {
  label?: string;
  placeholder?: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  error?: string;
  disabled?: boolean;
  searchPlaceholder?: string;
  onSearchChange?: (query: string) => Promise<string[]> | void;
  onInteraction?: () => void;
}

export const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  label,
  placeholder,
  value,
  options,
  onSelect,
  error,
  disabled = false,
  searchPlaceholder = 'Search...',
  onSearchChange,
  onInteraction,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<string[]>(options);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [modalHeight, setModalHeight] = useState(0.8); // 0.8 = 80% of screen
  const screenHeight = Dimensions.get('window').height;
  
  // Animation values for drag gesture
  const translateY = useRef(new Animated.Value(0)).current;
  const isDragging = useRef(false);
  const initialHeight = useRef(0.8);
  
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (_, gestureState) => {
        // Only start dragging if user is dragging vertically significantly
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only activate if vertical movement is significant
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderGrant: () => {
        isDragging.current = true;
        translateY.setOffset((translateY as any)._value);
        initialHeight.current = modalHeight;
      },
      onPanResponderMove: (_, gestureState) => {
        if (!isDragging.current) return;
        
        // Update position based on drag
        translateY.setValue(gestureState.dy);
        
        // Calculate new height based on drag
        const heightDelta = -gestureState.dy / screenHeight;
        const newHeight = Math.max(0.3, Math.min(1, initialHeight.current + heightDelta));
        setModalHeight(newHeight);
      },
      onPanResponderRelease: (_, gestureState) => {
        isDragging.current = false;
        translateY.flattenOffset();
        
        const dragThreshold = screenHeight * 0.15; // 15% of screen height
        const velocityThreshold = 0.5; // velocity threshold
        
        // Use velocity if significant, otherwise use distance
        const shouldClose = gestureState.vy > velocityThreshold || gestureState.dy > dragThreshold;
        const shouldExpand = gestureState.vy < -velocityThreshold || (gestureState.dy < -dragThreshold && modalHeight < 1);
        const shouldCollapse = gestureState.dy < -dragThreshold && modalHeight === 1;
        
        if (shouldClose) {
          // Dragged down enough to close
          handleClose();
        } else if (shouldExpand) {
          // Dragged up enough to expand to full screen
          expandToFullScreen();
        } else if (shouldCollapse) {
          // Dragged up when already full screen, go back to partial
          collapseToPartial();
        } else {
          // Snap back to current position or nearest snap point
          snapToNearest();
        }
      },
      onPanResponderTerminate: () => {
        isDragging.current = false;
        translateY.flattenOffset();
        snapToNearest();
      },
    })
  ).current;

  // Listen to keyboard events to adjust modal height
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  // Update filtered options when search query or options change
  useEffect(() => {
    if (onSearchChange) {
      // If custom search handler provided, use it
      const performSearch = async () => {
        if (searchQuery.length >= 2) {
          const results = await onSearchChange(searchQuery);
          if (Array.isArray(results)) {
            setFilteredOptions(results);
          }
        } else {
          setFilteredOptions(options.slice(0, 20));
        }
      };
      performSearch();
    } else {
      // Default local filtering
      const filtered = options.filter((option) =>
        option.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [searchQuery, options, onSearchChange]);

  const handleSelect = (option: string) => {
    onSelect(option);
    handleClose();
  };

  const handleOpen = () => {
    if (!disabled) {
      onInteraction?.();
      setIsOpen(true);
      setSearchQuery('');
    }
  };

  const handleClose = () => {
    Animated.timing(translateY, {
      toValue: screenHeight,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setIsOpen(false);
      setSearchQuery('');
      setModalHeight(0.8);
      translateY.setValue(0);
      Keyboard.dismiss();
    });
  };

  const expandToFullScreen = () => {
    setModalHeight(1);
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const collapseToPartial = () => {
    setModalHeight(0.8);
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const snapToNearest = () => {
    // Snap to nearest height: 0.8 (80%) or 1.0 (100%)
    const currentHeight = modalHeight;
    if (currentHeight < 0.9) {
      // Snap to 80%
      setModalHeight(0.8);
    } else {
      // Snap to 100%
      setModalHeight(1);
    }
    
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  // Reset animation when modal opens
  useEffect(() => {
    if (isOpen) {
      translateY.setValue(0);
      setModalHeight(0.8);
    }
  }, [isOpen, translateY]);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[
          styles.inputContainer,
          error && styles.error,
          disabled && styles.disabled,
        ]}
        onPress={handleOpen}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.valueText,
            !value && styles.placeholderText,
          ]}
        >
          {value || placeholder}
        </Text>
        <MaterialIcons
          name={isOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          size={24}
          color={COLORS.text.secondary}
        />
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={handleClose}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardAvoidingView}
            keyboardVerticalOffset={0}
          >
            <Animated.View
              style={[
                styles.modalContent,
                {
                  maxHeight: keyboardHeight > 0
                    ? screenHeight - keyboardHeight - 40
                    : screenHeight * modalHeight,
                  height: keyboardHeight > 0
                    ? screenHeight - keyboardHeight - 40
                    : screenHeight * modalHeight,
                  transform: [{ translateY: translateY }],
                },
              ]}
            >
              {/* Drag Handle Area - Entire header is draggable */}
              <View style={styles.dragArea} {...panResponder.panHandlers}>
                <View style={styles.dragHandleContainer}>
                  <View style={styles.dragHandle} />
                </View>
                <Pressable
                  style={styles.modalHeader}
                  onPress={(e) => e.stopPropagation()}
                >
                  <Text style={styles.modalTitle}>{label || 'Select an option'}</Text>
                  <TouchableOpacity
                    onPress={handleClose}
                    style={styles.closeButton}
                  >
                    <MaterialIcons name="close" size={24} color={COLORS.text.primary} />
                  </TouchableOpacity>
                </Pressable>
              </View>

              <View style={styles.searchContainer}>
                <MaterialIcons
                  name="search"
                  size={20}
                  color={COLORS.text.secondary}
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                  placeholderTextColor={COLORS.text.light}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearchQuery('')}
                    style={styles.clearButton}
                  >
                    <MaterialIcons name="clear" size={20} color={COLORS.text.secondary} />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.listContainer}>
                <FlatList
                  data={filteredOptions}
                  keyExtractor={(item) => item}
                  style={styles.list}
                  contentContainerStyle={styles.listContent}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={true}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.optionItem,
                        value === item && styles.optionItemSelected,
                      ]}
                      onPress={() => handleSelect(item)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          value === item && styles.optionTextSelected,
                        ]}
                      >
                        {item}
                      </Text>
                      {value === item && (
                        <MaterialIcons
                          name="check"
                          size={20}
                          color={COLORS.primary}
                        />
                      )}
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>No results found</Text>
                    </View>
                  }
                />
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    minHeight: 44,
  },
  error: {
    borderColor: COLORS.error,
  },
  disabled: {
    opacity: 0.5,
    backgroundColor: COLORS.surface,
  },
  valueText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.primary,
  },
  placeholderText: {
    color: COLORS.text.light,
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  keyboardAvoidingView: {
    width: '100%',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
    paddingBottom: SPACING.xl,
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  dragArea: {
    width: '100%',
  },
  dragHandleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    paddingTop: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.primary,
    paddingVertical: SPACING.sm,
  },
  clearButton: {
    padding: SPACING.xs,
  },
  listContainer: {
    flex: 1,
    minHeight: 200,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: SPACING.lg,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  optionItemSelected: {
    backgroundColor: COLORS.primary + '10',
  },
  optionText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.primary,
  },
  optionTextSelected: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
  },
});

