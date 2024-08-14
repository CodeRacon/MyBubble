import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UsersService } from '../../../utils/services/user.service';
import { ChannelService } from '../../../utils/services/channel.service';
import { Channel } from '../../../shared/models/channel.class';

@Component({
  selector: 'app-addchannel',
  standalone: true,
  imports: [RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './addchannel.component.html',
  styleUrl: './addchannel.component.scss',
})
export class AddchannelComponent {
  public channelservice = inject(ChannelService);
  public userservice = inject(UsersService);

  public currentChannel: Channel | undefined = undefined;
  public currentMessagesPath: string | undefined = undefined;

  public name: string = '';
  public description: string = '';

  addNewChannel() {
    this.channelservice.addNewChannelToFirestore(
      this.name,
      this.description,
      this.userservice.getAllUserIDs()
    );
  }

  setCurrentChannel(newChannel: Channel) {
    this.currentChannel = newChannel;
    this.currentMessagesPath = newChannel.channelMessagesPath;
  }
}
