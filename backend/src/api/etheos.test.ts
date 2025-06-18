import * as etheosApi from './etheos';
import { config } from '../config';
import { connectMqtt, subscribe, disconnectMqtt } from '../mqtt/mqttClient';

  // describe('getRoomConfig', () => {
  //   it('should fetch room config from real API', async () => {
  //     const data = await etheosApi.getRoomConfig(config.etheos.roomNumber as string) as any;
  //     console.log('Room config 返回数据:', data);
  //     expect(data).toHaveProperty('general');
  //     expect(data.general).toHaveProperty('room_number');
  //   });
  // });

  // describe('controlDevice', () => {
  //   it('should turn on the light (真实开灯)', async () => {
  //     // 1. 获取房间配置
  //     const roomConfig = await etheosApi.getRoomConfig(config.etheos.roomNumber as string) as any;
  //     const fs = require('fs');
  //     fs.writeFileSync('room-config.json', JSON.stringify(roomConfig, null, 2));
  //     // 2. 找到灯光开关实体
  //     const lightEntries = (roomConfig.entries || []).filter(
  //       (e: any) => e.class_id === 'lights' && e.category_id === 'dev_switch' && e.commands && e.commands.set_value
  //     );
  //     const lightEntry = lightEntries[0]; // 取第一个灯光开关
  //     if (!lightEntry) throw new Error('未找到灯光开关实体');
  //     // 3. 获取 commands.set_value.uri
  //     const fullUri: string = lightEntry.commands.set_value.uri;
  //     // 4. 发送开灯请求
  //     const result = await etheosApi.controlDevice(fullUri, { value: true });
  //     console.log('开灯返回数据:', result);
  //     expect(result).toHaveProperty('ok');
  //   });
  // });

  describe('controlDevice t_10_l2', () => {
    it('should turn on the light t_10_l2 and listen status via MQTT', function (done) {
      (async () => {
        // 1. 连接MQTT
        const token: string = await etheosApi.getToken();
        connectMqtt(config.etheos.username!, token);
        // 2. 订阅状态
        const topic = 'cs/hotels/itprdapep00671/status/rooms/00-08-0c-20-00-1c/devices/d_7_expansion-relay-s04-add0/components/c4/switch/status';
        let received = false;
        subscribe(topic, (recvTopic, message) => {
          const payload = message.toString();
          console.log('MQTT收到状态:', payload);
          received = true;
          disconnectMqtt();
          done();
        });
        // 3. 控制开灯
        const uri = '/itprdapep00671/control/rooms/00-08-0c-20-00-1c/devices/d_7_expansion-relay-s04-add0/components/c4/capabilities/switch/status';
        const result = await etheosApi.controlDevice(uri, { value: false });
        console.log('t_10_l2 关灯返回:', result);
        expect(result).toHaveProperty('ok');
        // 4. 等待MQTT消息
        setTimeout(() => {
          if (!received) done(new Error('未收到MQTT状态更新'));
        }, 5000);
      })();
    });

    // it('should turn off the light t_10_l2', async () => {
    //   const uri = '/itprdapep00671/control/rooms/00-08-0c-20-00-1c/devices/d_7_expansion-relay-s04-add0/components/c4/capabilities/switch/status';
    //   const result = await etheosApi.controlDevice(uri, { value: false });
    //   console.log('t_10_l2 关灯返回:', result);
    //   expect(result).toHaveProperty('ok');
    // });
  });
