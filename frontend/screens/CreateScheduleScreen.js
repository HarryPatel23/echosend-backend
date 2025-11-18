import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { Picker } from '@react-native-picker/picker';
import api from '../services/api';

const CreateScheduleScreen = ({ navigation }) => {
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [date, setDate] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [mode, setMode] = useState('date');
  const [recurring, setRecurring] = useState('once');
  const [file, setFile] = useState(null);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowPicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const showMode = (currentMode) => {
    setShowPicker(true);
    setMode(currentMode);
  };

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({});
    if (!result.canceled) {
      setFile(result.assets[0]);
    }
  };

  const createSchedule = async () => {
    if (!recipient || !message || !date) {
      Alert.alert('Error', 'Fill all fields');
      return;
    }

    const formData = new FormData();
    formData.append('recipient', recipient);
    formData.append('message', message);
    formData.append('send_at', date.toISOString());
    formData.append('recurring', recurring);

    if (file) {
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType,
      });
    }

    try {
      await api.post('/schedules', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      Alert.alert('Success', 'Schedule created');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.msg || 'Failed');
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <TextInput placeholder="Recipient (e.g. 919876543210)" value={recipient} onChangeText={setRecipient} keyboardType="numeric" style={{ borderWidth: 1, marginBottom: 10, padding: 10 }} />
      <TextInput placeholder="Message / Caption" value={message} onChangeText={setMessage} multiline style={{ borderWidth: 1, marginBottom: 10, padding: 10, height: 100 }} />

      <TouchableOpacity onPress={() => showMode('date')} style={{ marginBottom: 10 }}>
        <Text style={{ fontSize: 16 }}>Date: {date ? date.toLocaleDateString() : 'Pick date'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => showMode('time')} style={{ marginBottom: 10 }}>
        <Text style={{ fontSize: 16 }}>Time: {date ? date.toLocaleTimeString() : 'Pick time'}</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={date || new Date()}
          mode={mode}
          is24Hour
          display="default"
          onChange={onChange}
        />
      )}

      <Text>Recurring:</Text>
      <Picker selectedValue={recurring} onValueChange={setRecurring}>
        <Picker.Item label="Once" value="once" />
        <Picker.Item label="Daily" value="daily" />
        <Picker.Item label="Weekly" value="weekly" />
        <Picker.Item label="Weekdays (Mon-Fri)" value="weekdays" />
      </Picker>

      <Button title="Attach File" onPress={pickFile} />
      {file && <Text>Attached: {file.name} <Button title="Remove" onPress={() => setFile(null)} /></Text>}

      <Button title="Create Schedule" onPress={createSchedule} />
    </ScrollView>
  );
};

export default CreateScheduleScreen;
