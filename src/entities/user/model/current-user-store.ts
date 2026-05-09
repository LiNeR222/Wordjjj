import { TokenStore } from '@/entities/token/model';
import { SerializedError } from '@/shared/lib/serialized-error';
import { withErrorAndLoading } from '@/shared/lib/withErrorAndLoading';
import { makeAutoObservable, runInAction } from 'mobx';
import { userApi } from '../api';
import { UserProfile } from '../types';

//export class CurrentUserStore extends UserStore {
export class CurrentUserStore {
  instance: UserProfile = {} as UserProfile;
  initialized = false;
  loading: boolean = false;
  error: SerializedError | null = null;
  formErrors: { [key: string]: string | null } = {};
  isEditingUsername: boolean = false;
  isProfileModalOpen = false;
  tokenStore: TokenStore | null = null;

  constructor(tokenStore: TokenStore) {
    //super(mockUser);
    makeAutoObservable(this);
    this.tokenStore = tokenStore;
    this.fetchMyProfile();
  }
  fetchMyId = async () => {
    try {
      const id = await this.tokenStore?.getUserIdTokenBelongsTo();
      if (id) {
        runInAction(() => {
          this.instance.id = id;
        });
      } else {
        throw new Error('failed to fetch user id while current user store was created');
      }
    } catch (error) {
      console.error(error);
    }
  };
  fetchMyProfile = async () => {
    const result = await withErrorAndLoading(this, () => userApi.getMyProfile());
    if (result) {
      runInAction(() => {
        Object.assign(this.instance, result);
      });
    }
  };
  closeProfileModal = () => {
    this.isProfileModalOpen = false;
  };
  openProfileModal = () => {
    this.isProfileModalOpen = true;
  };
  toggleEditUsername = (value?: string) => {
    this.isEditingUsername = !this.isEditingUsername;
    if (value) {
      this.instance.name = value;
    }
  };
  validateUsername = (value: string): boolean => {
    if (value.length < 3 || value.length > 20) {
      this.setErrors({ username: 'Имя пользователя должно быть от 3 до 20 символов' });
      return false;
    }
    this.setErrors({ username: null });
    this.instance.name = value;
    return true;
  };

  setErrors = (errors: { [key: string]: string | null }) => {
    this.formErrors = { ...this.formErrors, ...errors };
  };
  resetErrors = () => {
    this.formErrors = {};
  };

  saveUsernameChanges = async (newName: string) => {
    this.loading = true;
    try {
      await userApi.updateUsername(newName);
      runInAction(() => {
        this.instance.name = newName;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error as SerializedError;
      });
    } finally {
      runInAction(() => {
        this.loading = false;
        this.toggleEditUsername();
      });
    }
  };

  uploadAvatar = async (file: File) => {
    if (!this.instance.id) {
      return;
    }
    this.loading = true;
    try {
      const formData = new FormData();
      formData.append('file', file, file.name);
      const response = await userApi.uploadMyAvatar(formData);
      if (response) {
        runInAction(() => {
          //ссылка на аватар пользователя всегда одна и та же
          this.instance = { ...this.instance, profile_picture: `${response.profile_picture}?${Date.now()}` };
        });
      }
    } catch (error) {
      runInAction(() => {
        this.error = error as SerializedError;
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  removeAvatar = async () => {
    const response = await withErrorAndLoading(this, () => userApi.removeMyAvatar());
    if (response) {
      runInAction(() => {
        //ссылка на аватар пользователя всегда одна и та же
        this.instance = { ...this.instance, profile_picture: `${response.profile_picture}?${Date.now()}` };
      });
    }
  };

  get user() {
    return this.instance;
  }
}
