import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  CircularProgress
} from "@mui/material";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import { AUTH0_AUDIENCE } from "../../constants";

interface FoodFormData {
  name: string;
  origin: string;
  description?: string;
  nutrition?: string;
}

const NewFoodItemPage = () => {
  const {
    getAccessTokenSilently
  } = useAuth();
  const [formData, setFormData] = useState<FoodFormData>({
    name: '',
    origin: '',
    description: '',
    nutrition: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange =
    (field: keyof FoodFormData) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value
      }));
    };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.origin.trim()) {
      newErrors.origin = "Origin is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!validate()) return;

    try {
      setIsSubmitting(true);
      setSuccess(false);
      
      const token = await getAccessTokenSilently();
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };
      const body = {
        foodName: formData.name,
        foodOrigin: formData.origin,
        foodAttributes: {
          description: formData.description,
          nutrition: formData.nutrition
        }
      };
      const url = `${AUTH0_AUDIENCE}foods`;
      await axios.post(url, body, { headers: headers });

      setSuccess(true);

      // Reset form
      setFormData({
        name: "",
        origin: "",
        description: "",
        nutrition: ""
      });

    } catch (error) {
      console.error("Failed to submit food item:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 6 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Submit New Food Item
          </Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              label="Name"
              fullWidth
              required
              margin="normal"
              value={formData.name}
              onChange={handleChange("name")}
              error={!!errors.name}
              helperText={errors.name}
            />

            <TextField
              label="Origin"
              fullWidth
              required
              margin="normal"
              value={formData.origin}
              onChange={handleChange("origin")}
              error={!!errors.origin}
              helperText={errors.origin}
            />

            <TextField
              label="Description"
              fullWidth
              margin="normal"
              multiline
              minRows={3}
              value={formData.description}
              onChange={handleChange("description")}
            />

            <TextField
              label="Nutrition"
              fullWidth
              margin="normal"
              multiline
              minRows={3}
              value={formData.nutrition}
              onChange={handleChange("nutrition")}
            />

            <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Submit"
                )}
              </Button>
            </Box>

            {success && (
              <Typography
                variant="body2"
                color="success.main"
                sx={{ mt: 2 }}
              >
                Food item submitted successfully!
              </Typography>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default NewFoodItemPage;
