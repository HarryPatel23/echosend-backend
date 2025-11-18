import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, Button, Alert, TouchableOpacity } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';

const ScheduleItem = ({ item, onDelete }) => (
  <View style={{ padding: 15, borderBottomWidth: 1 }}>
    <Text>To: {item.recipient}</Text>
    <Text>Message: {item.message || '(no text)'}</Text>
    <Text>Send: {new Date(item.send_at).toLocaleString()}</Text>
    <Text>Recurring: {item.recurring}</Text>
    {item.media_url && <Text>Media: {item.media_type}</Text>}
    <Button title="Delete" color="red" onPress={() => onDelete(item.id)} />
  </View>
);

const DashboardScreen = ({ navigation }) => {
  const [schedules, setSchedules] = useState([]);
  const { logout } = useContext(AuthContext);

  const loadSchedules = async () => {
    try {
      const res = await api.get('/schedules');
      setSchedules(res.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load schedules');
    }
  };

  const deleteSchedule = async (id) => {
    try {
      await api.delete(`/schedules/${id}`);
      setSchedules(schedules.filter(s => s.id !== id));
    } catch (err) {
      Alert.alert('Error', 'Delete failed');
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadSchedules);
    loadSchedules();
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={schedules}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => <ScheduleItem item={item} onDelete={deleteSchedule} />}
        ListEmptyComponent={<Text>No schedules yet</Text>}
      />
      <TouchableOpacity
        style={{ backgroundColor: '#007AFF', padding: 15, margin: 10, borderRadius: 10 }}
        onPress={() => navigation.navigate('CreateSchedule')}
      >
        <Text style={{ color: '#fff', textAlign: 'center', fontSize: 18 }}>+ New Schedule</Text>
      </TouchableOpacity>
      <Button title="Logout" onPress={logout} />
    </View>
  );
};

export default DashboardScreen;
