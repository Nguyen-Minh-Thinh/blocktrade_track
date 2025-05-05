import React, { useState } from "react";
import { Form, Input, Button, Alert, Tabs, Spin, Avatar, Upload, message } from "antd";
import { CameraOutlined, LockOutlined, UserOutlined, MailOutlined, EditOutlined } from "@ant-design/icons";
import { updateUser, verifyOldPassword } from '../../api/auth';

const { TabPane } = Tabs;

const ProfileEditor = ({ userData, onUserUpdate }) => {
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileErrorMessage, setProfileErrorMessage] = useState("");
  const [profileSuccessMessage, setProfileSuccessMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState("");
  
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // Handle image upload
  const handleImageChange = (info) => {
    if (info.file.status === 'uploading') {
      return;
    }
    
    if (info.file.status === 'done') {
      setImage(info.file.originFileObj);
      
      // Create preview image
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(info.file.originFileObj);
    }
  };

  // Handle profile data update
  const handleProfileSubmit = async (values) => {
    setProfileErrorMessage("");
    setProfileSuccessMessage("");
    
    if (!userData.user_id) {
      setProfileErrorMessage("User ID is missing. Please log in again.");
      return;
    }

    setLoading(true);
    try {
      const formData = {
        ...values,
        user_id: userData.user_id,
        points: userData.points
      };
      
      const response = await updateUser(formData, image);
      
      // Update local storage with new user data
      const updatedUser = {
        ...userData,
        ...values,
        image_url: response.image_url || userData.image_url,
        points: response.points || userData.points
      };
      
      // Update local storage
      localStorage.setItem("userLogin", JSON.stringify(updatedUser));
      
      // Update parent component
      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }
      
      // Trigger a global user update event
      window.dispatchEvent(new Event("userUpdated"));
      
      setProfileSuccessMessage("Profile updated successfully");
      setTimeout(() => setProfileSuccessMessage(""), 2000);
      
      // Reset preview if needed
      if (response.image_url) {
        setPreviewImage("");
        setImage(null);
      }
    } catch (error) {
      setProfileErrorMessage(error.error || "Failed to update profile");
      setTimeout(() => setProfileErrorMessage(""), 2000);
    } finally {
      setLoading(false);
    }
  };

  // Handle password update
  const handlePasswordSubmit = async (values) => {
    setPasswordErrorMessage("");
    setPasswordSuccessMessage("");
    
    const { oldPassword, newPassword, confirmPassword } = values;
    
    if (newPassword !== confirmPassword) {
      setPasswordErrorMessage("New password and confirmation don't match");
      return;
    }

    setLoading(true);
    try {
      // Verify old password
      await verifyOldPassword(userData.username, oldPassword);
      
      // Update password
      const passwordData = { 
        user_id: userData.user_id, 
        password: newPassword 
      };
      await updateUser(passwordData, null);
      
      setPasswordSuccessMessage("Password updated successfully");
      setTimeout(() => setPasswordSuccessMessage(""), 2000);
      
      passwordForm.resetFields();
    } catch (error) {
      if (error.error === "Old password is incorrect") {
        setPasswordErrorMessage("Old password is incorrect");
      } else {
        setPasswordErrorMessage(error.error || "Failed to update password");
      }
      setTimeout(() => setPasswordErrorMessage(""), 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
      <Tabs defaultActiveKey="profile" centered className="dark-tabs">
        <TabPane 
          tab={
            <span className="flex items-center gap-2 text-gray-300">
              <UserOutlined />
              Profile Information
            </span>
          } 
          key="profile"
        >
          <div className="max-w-xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="relative inline-block">
                <Avatar
                  size={100}
                  src={previewImage || userData.image_url || "https://via.placeholder.com/100"}
                  alt="Profile"
                  className="border-2 border-gray-600"
                />
                <Upload
                  name="avatar"
                  showUploadList={false}
                  customRequest={({ onSuccess }) => setTimeout(() => onSuccess("ok"), 0)}
                  onChange={handleImageChange}
                  accept="image/*"
                >
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<CameraOutlined />}
                    size="small"
                    className="absolute bottom-0 right-0 bg-blue-500 border-none hover:bg-blue-600"
                  />
                </Upload>
              </div>
            </div>

            {profileErrorMessage && (
              <Alert message={profileErrorMessage} type="error" showIcon className="mb-4" />
            )}
            
            {profileSuccessMessage && (
              <Alert message={profileSuccessMessage} type="success" showIcon className="mb-4" />
            )}

            <Form
              form={form}
              layout="vertical"
              initialValues={{
                name: userData.name || "",
                email: userData.email || "",
                username: userData.username || ""
              }}
              onFinish={handleProfileSubmit}
              className="dark-form"
            >
              <Form.Item 
                name="name" 
                label={<span className="text-gray-300">Your Name</span>}
                rules={[{ required: true, message: "Please enter your name" }]}
              >
                <Input 
                  prefix={<UserOutlined className="text-gray-500" />} 
                  placeholder="Your full name" 
                  className="bg-gray-700 border-gray-600 text-white rounded-md"
                />
              </Form.Item>

              <Form.Item 
                name="email" 
                label={<span className="text-gray-300">Email Address</span>}
                rules={[
                  { required: true, message: "Please enter your email" },
                  { type: "email", message: "Please enter a valid email" }
                ]}
              >
                <Input 
                  prefix={<MailOutlined className="text-gray-500" />} 
                  placeholder="Your email address" 
                  className="bg-gray-700 border-gray-600 text-white rounded-md"
                />
              </Form.Item>

              <Form.Item 
                name="username" 
                label={<span className="text-gray-300">Username</span>}
                rules={[{ required: true, message: "Please enter your username" }]}
              >
                <Input 
                  prefix={<EditOutlined className="text-gray-500" />} 
                  placeholder="Your username" 
                  className="bg-gray-700 border-gray-600 text-white rounded-md"
                />
              </Form.Item>

              <Form.Item className="mb-0">
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  block 
                  loading={loading}
                  className="h-10 bg-blue-600 hover:bg-blue-700 border-none"
                >
                  Save Changes
                </Button>
              </Form.Item>
            </Form>
          </div>
        </TabPane>

        <TabPane 
          tab={
            <span className="flex items-center gap-2 text-gray-300">
              <LockOutlined />
              Change Password
            </span>
          } 
          key="password"
        >
          <div className="max-w-xl mx-auto">
            {passwordErrorMessage && (
              <Alert message={passwordErrorMessage} type="error" showIcon className="mb-4" />
            )}
            
            {passwordSuccessMessage && (
              <Alert message={passwordSuccessMessage} type="success" showIcon className="mb-4" />
            )}

            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handlePasswordSubmit}
              className="dark-form"
            >
              <Form.Item 
                name="oldPassword" 
                label={<span className="text-gray-300">Current Password</span>}
                rules={[{ required: true, message: "Please enter your current password" }]}
              >
                <Input.Password 
                  prefix={<LockOutlined className="text-gray-500" />} 
                  placeholder="Your current password" 
                  className="bg-gray-700 border-gray-600 text-white rounded-md"
                />
              </Form.Item>

              <Form.Item 
                name="newPassword" 
                label={<span className="text-gray-300">New Password</span>}
                rules={[{ required: true, message: "Please enter a new password" }]}
              >
                <Input.Password 
                  prefix={<LockOutlined className="text-gray-500" />} 
                  placeholder="Your new password" 
                  className="bg-gray-700 border-gray-600 text-white rounded-md"
                />
              </Form.Item>

              <Form.Item 
                name="confirmPassword" 
                label={<span className="text-gray-300">Confirm New Password</span>}
                rules={[
                  { required: true, message: "Please confirm your new password" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('The two passwords do not match'));
                    },
                  }),
                ]}
              >
                <Input.Password 
                  prefix={<LockOutlined className="text-gray-500" />} 
                  placeholder="Confirm your new password" 
                  className="bg-gray-700 border-gray-600 text-white rounded-md"
                />
              </Form.Item>

              <Form.Item className="mb-0">
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  block 
                  loading={loading}
                  className="h-10 bg-blue-600 hover:bg-blue-700 border-none"
                >
                  Update Password
                </Button>
              </Form.Item>
            </Form>
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ProfileEditor; 