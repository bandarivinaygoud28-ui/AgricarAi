export interface SampleCropImage {
  id: string;
  crop: string;
  affected_area: string;
  label: string;
  url: string;
  isDemo: boolean;
}

export const sampleCropImages: SampleCropImage[] = [
  {
    id: "tomato-leaf-blight",
    crop: "Tomato",
    affected_area: "Leaf",
    label: "Demo: Tomato Leaf (Early/Late Blight)",
    url: "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=600&auto=format&fit=crop&q=80",
    isDemo: true
  },
  {
    id: "tomato-fruit-rot",
    crop: "Tomato",
    affected_area: "Fruit / Boll",
    label: "Demo: Tomato Fruit Lesion / Rot",
    url: "https://images.unsplash.com/photo-1546470427-e26264be0b11?w=600&auto=format&fit=crop&q=80",
    isDemo: true
  },
  {
    id: "paddy-leaf-blast",
    crop: "Paddy",
    affected_area: "Leaf",
    label: "Demo: Paddy Rice Blast (Leaf)",
    url: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&auto=format&fit=crop&q=80",
    isDemo: true
  },
  {
    id: "cotton-leaf-curl",
    crop: "Cotton",
    affected_area: "Leaf",
    label: "Demo: Cotton Leaf Curl & Spot",
    url: "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=600&auto=format&fit=crop&q=80",
    isDemo: true
  },
  {
    id: "potato-leaf-blight",
    crop: "Potato",
    affected_area: "Leaf",
    label: "Demo: Potato Foliar Blight (Leaf)",
    url: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=600&auto=format&fit=crop&q=80",
    isDemo: true
  },
  {
    id: "maize-leaf-blight",
    crop: "Maize",
    affected_area: "Leaf",
    label: "Demo: Maize Turcicum Leaf Blight",
    url: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&auto=format&fit=crop&q=80",
    isDemo: true
  }
];

